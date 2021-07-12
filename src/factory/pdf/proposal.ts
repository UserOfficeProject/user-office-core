import { logger } from '@esss-swap/duo-logger';

import baseContext from '../../buildContext';
import { Proposal } from '../../models/Proposal';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId,
} from '../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { isRejection } from '../../models/Rejection';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../../models/TechnicalReview';
import { DataType } from '../../models/Template';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { getFileAttachments, Attachment } from '../util';
import { collectSamplePDFData, SamplePDFData } from './sample';

type ProposalPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  coProposers: BasicUserDetails[];
  questionarySteps: QuestionaryStep[];
  attachments: Attachment[];
  technicalReview?: Omit<TechnicalReview, 'status'> & { status: string };
  samples: Array<Pick<SamplePDFData, 'sample' | 'sampleQuestionaryFields'>>;
};

const getTechnicalReviewHumanReadableStatus = (
  status: TechnicalReviewStatus
): string => {
  switch (status) {
    case TechnicalReviewStatus.FEASIBLE:
      return 'Feasible';
    case TechnicalReviewStatus.PARTIALLY_FEASIBLE:
      return 'Partially feasible';
    case TechnicalReviewStatus.UNFEASIBLE:
      return 'Unfeasible';
    default:
      return `Unknown status: ${status}`;
  }
};

const getTopicActiveAnswers = (
  questionarySteps: QuestionaryStep[],
  topicId: number
) => {
  const step = getQuestionaryStepByTopicId(questionarySteps, topicId);

  return step
    ? (step.fields.filter((field) => {
        return areDependenciesSatisfied(questionarySteps, field.question.id);
      }) as Answer[])
    : [];
};

export const collectProposalPDFData = async (
  proposalPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalPDFData> => {
  const userAuthorization = baseContext.userAuthorization;
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

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
    proposalPk
  );

  if (!principalInvestigator || !coProposers) {
    throw new Error('User was not PI or co-proposer');
  }

  const sampleAttachments: Attachment[] = [];

  const samples = await baseContext.queries.sample.getSamples(user, {
    filter: { proposalPk },
  });

  const samplePDFData = (
    await Promise.all(
      samples.map((sample) => collectSamplePDFData(sample.id, user))
    )
  ).map(({ sample, sampleQuestionaryFields, attachments }) => {
    sampleAttachments.push(...attachments);

    return { sample, sampleQuestionaryFields };
  });

  notify?.(
    `${proposal.created.getUTCFullYear()}_${principalInvestigator.lastname}_${
      proposal.proposalId
    }.pdf`
  );

  const out: ProposalPDFData = {
    proposal,
    principalInvestigator,
    coProposers,
    questionarySteps: [],
    attachments: [],
    samples: samplePDFData,
  };

  // Information from each topic in proposal
  for (const step of questionarySteps) {
    if (!step) {
      logger.logError('step not found', { ...questionarySteps }); // TODO: fix type of the second param in the lib (don't use Record<string, unknown>)

      throw 'Could not download generated PDF';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id).filter(
      // skip `PROPOSAL_BASIS` types
      (answer) => answer.question.dataType !== DataType.PROPOSAL_BASIS
    );

    // if the questionary step has nothing else but `PROPOSAL_BASIS` question
    // skip the whole step because the first page already has every related information
    if (answers.length === 0) {
      continue;
    }

    const questionaryAttachments: Attachment[] = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      questionaryAttachments.push(...getFileAttachments(answer));

      if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
        answer.value = samples
          .filter((sample) => sample.questionId === answer.question.id)
          .map((sample) => sample);
      }
    }

    out.questionarySteps.push({
      ...step,
      fields: answers,
    });
    out.attachments.push(...questionaryAttachments);
    out.attachments.push(...sampleAttachments);
  }

  if (userAuthorization.isReviewerOfProposal(user, proposal.primaryKey)) {
    const technicalReview = await baseContext.queries.review.technicalReviewForProposal(
      user,
      proposal.primaryKey
    );
    if (technicalReview) {
      out.technicalReview = {
        ...technicalReview,
        status: getTechnicalReviewHumanReadableStatus(technicalReview.status),
      };
    }
  }

  return out;
};
