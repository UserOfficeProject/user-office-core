import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { TemplateDataSource } from '../../datasources/TemplateDataSource';
import { DownloadOptions } from '../../middlewares/factory/factoryServices';
import { GenericTemplate } from '../../models/GenericTemplate';
import { Proposal } from '../../models/Proposal';
import {
  areDependenciesSatisfied,
  getAllFields,
  getTopicActiveAnswers,
} from '../../models/ProposalModelFunctions';
import { QuestionaryStep, Answer } from '../../models/Questionary';
import { isRejection } from '../../models/Rejection';
import { Sample } from '../../models/Sample';
import { DataType, Question } from '../../models/Template';
import { UserWithRole } from '../../models/User';
import { GenericTemplatesArgs } from '../../resolvers/queries/GenericTemplatesQuery';
import { QuestionsFilter } from '../../resolvers/queries/QuestionsQuery';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { getFileAttachments, Attachment } from '../util';

export type ProposalAttachmentData = {
  proposal: Proposal;
  attachments: Attachment[];
};

type GetTemplates = (filter: {
  questionIds: string[];
}) => Promise<Question[] | null>;

const addProposalAttachments = (
  proposalAttachmentData: ProposalAttachmentData,
  questionarySteps: QuestionaryStep[],
  questionIds: string[]
) => {
  const updatedProposalAttachmentData = { ...proposalAttachmentData };
  for (const step of questionarySteps) {
    if (!step) {
      logger.logError('step not found', { ...questionarySteps });

      throw 'Could not download generated PDF because there were no steps found when adding attachments';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id).filter(
      (answer) =>
        answer.question.dataType === DataType.FILE_UPLOAD &&
        questionIds.includes(answer.question.id)
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
    }
    updatedProposalAttachmentData.attachments.push(...questionaryAttachments);
  }

  return updatedProposalAttachmentData;
};
const getQuestionIdsData = async (
  getTemplates: GetTemplates,
  questionIds?: string[]
): Promise<string[]> => {
  if (!questionIds) {
    throw new Error('Could not get attachments question ids not set');
  }
  const questionIdsData = await getTemplates({
    questionIds,
  }).then((questions) => {
    if (!questions) {
      throw new Error('Could not fetch questions');
    }

    return questions.map((question) => question.id);
  });

  questionIds.forEach((questionId) => {
    if (!questionIdsData.includes(questionId)) {
      throw new Error(`Could not fetch question ${questionId}`);
    }
  });

  return questionIdsData;
};

async function getGenericTemplateAttachments(
  templates: GenericTemplate[] | Sample[],
  questionIds: string[],
  getQuestionarySteps: (
    questionaryId: number
  ) => Promise<QuestionaryStep[] | null>
): Promise<Attachment[]> {
  return (
    await Promise.all(
      templates.map(async (template) => {
        const attachments: Attachment[] = [];

        const questionarySteps = await getQuestionarySteps(
          template.questionaryId
        );

        if (!questionarySteps) {
          throw new Error(
            `Questionary steps for Questionary ID '${template.questionaryId}' not found, or the user has insufficient rights`
          );
        }

        const completedFields = (
          getAllFields(questionarySteps) as Answer[]
        ).filter((field) =>
          areDependenciesSatisfied(questionarySteps, field.question.id)
        );

        completedFields.forEach((fieldAnswer) => {
          if (questionIds.includes(fieldAnswer.question.id)) {
            attachments.push(...getFileAttachments(fieldAnswer));
          }
        });

        return attachments;
      })
    )
  ).flat(1);
}
const init = (user: UserWithRole) => {
  return {
    getProposal: (() => {
      return (proposalpk: number) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<ProposalDataSource>(Tokens.ProposalDataSource)
            .get(proposalpk);
        }

        return baseContext.queries.proposal.get(user, proposalpk);
      };
    })(),
    getProposalById: (() => {
      return (proposalId: string) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<ProposalDataSource>(Tokens.ProposalDataSource)
            .getProposalById(proposalId);
        }

        return baseContext.queries.proposal.getProposalById(user, proposalId);
      };
    })(),
    getQuestions: (() => {
      return (filter: QuestionsFilter) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<TemplateDataSource>(Tokens.TemplateDataSource)
            .getQuestions(filter);
        }

        return baseContext.queries.template.getQuestions(user, filter);
      };
    })(),
    getQuestionarySteps: (() => {
      return (questionaryId: number) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<QuestionaryDataSource>(Tokens.QuestionaryDataSource)
            .getQuestionarySteps(questionaryId);
        }

        return baseContext.queries.questionary.getQuestionarySteps(
          user,
          questionaryId
        );
      };
    })(),
    getSamples: (() => {
      return (args: SamplesArgs) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<SampleDataSource>(Tokens.SampleDataSource)
            .getSamples(args);
        }

        return baseContext.queries.sample.getSamples(user, args);
      };
    })(),
    getGenericTemplates: (() => {
      return (args: GenericTemplatesArgs) => {
        if (user.isApiAccessToken) {
          return container
            .resolve<GenericTemplateDataSource>(
              Tokens.GenericTemplateDataSource
            )
            .getGenericTemplates(args, user);
        }

        return baseContext.queries.genericTemplate.getGenericTemplates(
          user,
          args
        );
      };
    })(),
  };
};
export const collectProposalAttachmentData = async (
  proposalPk: number,
  user: UserWithRole,
  options?: DownloadOptions
): Promise<ProposalAttachmentData> => {
  const {
    getProposal,
    getProposalById,
    getQuestions,
    getQuestionarySteps,
    getSamples,
    getGenericTemplates,
  } = init(user);

  // Set proposal data
  let proposal = null;
  const proposalFilter = options?.filter ?? null;
  if (proposalFilter && proposalFilter === 'id') {
    proposal = await getProposalById(proposalPk.toString());
  } else {
    proposal = await getProposal(proposalPk);
  }

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  const questionIds = await getQuestionIdsData(
    getQuestions,
    options?.questionIds
  );

  const questionarySteps = await getQuestionarySteps(proposal.questionaryId);

  if (isRejection(questionarySteps) || questionarySteps == null) {
    logger.logError('Could not fetch questionary steps', {
      reason: questionarySteps?.reason || 'questionary steps is null',
    });
    throw new Error('Could not fetch questionary steps');
  }

  const genericTemplates = await getGenericTemplates({
    filter: { proposalPk: proposal.primaryKey },
  });

  const genericTemplatesAttachments = await getGenericTemplateAttachments(
    genericTemplates,
    questionIds,
    getQuestionarySteps
  );

  const samples = await getSamples({
    filter: { proposalPk: proposal.primaryKey },
  });

  const samplesAttachments = await getGenericTemplateAttachments(
    samples,
    questionIds,
    getQuestionarySteps
  );
  const proposalAttachmentData: ProposalAttachmentData = addProposalAttachments(
    {
      proposal,
      attachments: [...genericTemplatesAttachments, ...samplesAttachments],
    },
    questionarySteps,
    questionIds
  );

  return proposalAttachmentData;
};
