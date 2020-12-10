import baseContext from '../../buildContext';
import { questionaryDataSource } from '../../datasources';
import { Proposal } from '../../models/Proposal';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId,
} from '../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { TechnicalReview } from '../../models/TechnicalReview';
import { DataType } from '../../models/Template';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { isRejection } from '../../rejection';
import { getFileAttachmentIds } from '../util';
import { collectSamplePDFData, SamplePDFData } from './sample';

type ProposalPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  coProposers: BasicUserDetails[];
  questionarySteps: QuestionaryStep[];
  attachmentIds: string[];
  technicalReview?: TechnicalReview;
  samples: Array<Pick<SamplePDFData, 'sample' | 'sampleQuestionaryFields'>>;
};

const getTopicActiveAnswers = (
  questionarySteps: QuestionaryStep[],
  topicId: number
) => {
  const step = getQuestionaryStepByTopicId(questionarySteps, topicId);

  return step
    ? (step.fields.filter(field => {
        return areDependenciesSatisfied(
          questionarySteps,
          field.question.proposalQuestionId
        );
      }) as Answer[])
    : [];
};

const collectSubtemplateData = async (answer: Answer) => {
  const subQuestionaryIds = answer.value;
  const attachmentIds: string[] = [];

  const questionaryAnswers: Array<{ fields: Answer[] }> = [];

  for (const subQuestionaryId of subQuestionaryIds) {
    const subQuestionarySteps = await questionaryDataSource.getQuestionarySteps(
      subQuestionaryId
    );

    const stepAnswers: Answer[] = [];

    subQuestionarySteps.forEach(questionaryStep => {
      const answers = getTopicActiveAnswers(
        subQuestionarySteps,
        questionaryStep.topic.id
      );

      for (const answer of answers) {
        stepAnswers.push(answer);
        attachmentIds.push(...getFileAttachmentIds(answer));
      }
    });

    questionaryAnswers.push({
      fields: stepAnswers,
    });
  }

  return {
    questionaryAnswers,
    attachmentIds,
  };
};

export const collectProposalPDFData = async (
  proposalId: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalPDFData> => {
  const userAuthorization = baseContext.userAuthorization;
  const proposal = await baseContext.queries.proposal.get(user, proposalId);

  // Authenticate user
  if (!proposal || !userAuthorization.hasAccessRights(user, proposal)) {
    throw new Error('User was not allowed to download PDF');
  }

  const queries = baseContext.queries.questionary;

  const questionarySteps = await queries.getQuestionarySteps(
    user,
    proposal.questionaryId
  );

  if (isRejection(questionarySteps) || questionarySteps == null) {
    throw new Error('Could not fetch questionary');
  }

  const principalInvestigator = await baseContext.queries.user.getBasic(
    user,
    proposal.proposerId
  );
  const coProposers = await baseContext.queries.user.getProposers(
    user,
    proposalId
  );

  if (!principalInvestigator || !coProposers) {
    throw new Error('User was not PI or co-proposer');
  }

  const sampleAttachmentIds: string[] = [];

  // use random samples until https://jira.esss.lu.se/browse/SWAP-1184 is implemented
  const testSamples = await baseContext.queries.sample.getSamples(user, {});

  const samplePDFData = (
    await Promise.all(
      testSamples
        .slice(0, 1)
        .map(sample => collectSamplePDFData(sample.id, user))
    )
  ).map(({ sample, sampleQuestionaryFields, attachmentIds }) => {
    sampleAttachmentIds.push(...attachmentIds);

    return { sample, sampleQuestionaryFields };
  });

  notify?.(
    `${proposal.created.getUTCFullYear()}_${principalInvestigator.lastname}_${
      proposal.shortCode
    }.pdf`
  );

  const out: ProposalPDFData = {
    proposal,
    principalInvestigator,
    coProposers,
    questionarySteps: [],
    attachmentIds: [],
    samples: samplePDFData,
  };

  // Information from each topic in proposal
  for (const step of questionarySteps) {
    if (!step) {
      console.error('step not found', questionarySteps);

      throw 'Could not download generated PDF';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id);

    const questionaryAttachmentIds = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      questionaryAttachmentIds.push(...getFileAttachmentIds(answer));

      if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
        const {
          attachmentIds,
          questionaryAnswers,
        } = await collectSubtemplateData(answer);

        answers[i].value = questionaryAnswers;
        questionaryAttachmentIds.push(...attachmentIds);
      }
    }

    out.questionarySteps.push({
      ...step,
      fields: answers,
    });
    out.attachmentIds.push(...questionaryAttachmentIds);
    out.attachmentIds.push(...sampleAttachmentIds);
  }

  if (userAuthorization.isReviewerOfProposal(user, proposal.id)) {
    const technicalReview = await baseContext.queries.review.technicalReviewForProposal(
      user,
      proposal.id
    );
    if (technicalReview) {
      out.technicalReview = technicalReview;
    }
  }

  return out;
};
