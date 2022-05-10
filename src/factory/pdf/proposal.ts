import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { ProposalAuthorization } from '../../auth/ProposalAuthorization';
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
import {
  collectGenericTemplatePDFData,
  GenericTemplatePDFData,
} from './genericTemplates';
import { collectSamplePDFData, SamplePDFData } from './sample';
type ProposalPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  coProposers: BasicUserDetails[];
  questionarySteps: QuestionaryStep[];
  attachments: Attachment[];
  technicalReview?: Omit<TechnicalReview, 'status'> & { status: string };
  samples: Array<Pick<SamplePDFData, 'sample' | 'sampleQuestionaryFields'>>;
  genericTemplates: Array<
    Pick<
      GenericTemplatePDFData,
      'genericTemplate' | 'genericTemplateQuestionaryFields'
    >
  >;
};

const getTechnicalReviewHumanReadableStatus = (
  status: TechnicalReviewStatus | null
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
  const proposalAuth = container.resolve(ProposalAuthorization);
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  // Authenticate user
  const hasReadRights = await proposalAuth.hasReadRights(user, proposal);
  if (hasReadRights === false) {
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

  const genericTemplateAttachments: Attachment[] = [];

  const genericTemplates =
    await baseContext.queries.genericTemplate.getGenericTemplates(user, {
      filter: { proposalPk },
    });

  const genericTemplatePDFData = (
    await Promise.all(
      genericTemplates.map((genericTemplate) =>
        collectGenericTemplatePDFData(genericTemplate.id, user)
      )
    )
  ).map(
    ({ genericTemplate, genericTemplateQuestionaryFields, attachments }) => {
      genericTemplateAttachments.push(...attachments);

      return { genericTemplate, genericTemplateQuestionaryFields };
    }
  );

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
    genericTemplates: genericTemplatePDFData,
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
      } else if (answer.question.dataType === DataType.GENERIC_TEMPLATE) {
        answer.value = genericTemplates
          .filter(
            (genericTemplate) =>
              genericTemplate.questionId === answer.question.id
          )
          .map((genericTemplate) => genericTemplate);
      }
    }

    out.questionarySteps.push({
      ...step,
      fields: answers,
    });
    out.attachments.push(...questionaryAttachments);
    out.attachments.push(...sampleAttachments);
    out.attachments.push(...genericTemplateAttachments);
  }

  if (await proposalAuth.isReviewerOfProposal(user, proposal.primaryKey)) {
    const technicalReview =
      await baseContext.queries.review.technicalReviewForProposal(
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
