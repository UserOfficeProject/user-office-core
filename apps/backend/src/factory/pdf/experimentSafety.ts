import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { ExperimentSafetyPdfTemplateDataSource } from '../../datasources/ExperimentSafetyPdfTemplateDataSource';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { Experiment, ExperimentSafety } from '../../models/Experiment';
import { Instrument } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { QuestionaryStep } from '../../models/Questionary';
import { isRejection } from '../../models/Rejection';
import { Status } from '../../models/Status';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { ExperimentSafetyPdfTemplate } from '../../resolvers/types/ExperimentSafetyPdfTemplate';
import { Attachment } from '../util';
import {
  collectExperimentSamplePDFData,
  ExperimentSamplePDFData,
} from './experimentSample';
import { collectGenericTemplatePDFData } from './genericTemplates';
import { collectSamplePDFData } from './sample';

export type ExperimentSafetyPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  experiment: Experiment;
  experimentSafety: ExperimentSafety;
  experimentSafetyStatus: Status | null;
  localContact: BasicUserDetails | null;
  instrument: Instrument | null;
  esiQuestionary: {
    questionarySteps: QuestionaryStep[];
    answers: Record<string, any>;
  };
  safetyReviewQuestionary: {
    questionarySteps: QuestionaryStep[];
    answers: Record<string, any>;
  };
  experimentSamples: ExperimentSamplePDFData[];
  pdfTemplate: ExperimentSafetyPdfTemplate | null;
  attachments: Attachment[];
};

const getSampleQuestionarySteps = async (
  questionaryId: number
): Promise<QuestionaryStep[]> => {
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const questionarySteps =
    await questionaryDataSource.getQuestionarySteps(questionaryId);
  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${questionaryId}' not found, or the user has insufficient rights`
    );
  }

  return questionarySteps;
};

const getQuestionary = async (questionaryId: number) => {
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const questionary = await questionaryDataSource.getQuestionary(questionaryId);

  if (!questionary) {
    throw new Error(`Questionary with ID '${questionaryId}' not found`);
  }

  return questionary;
};

export function extractAnswerMap(questionarySteps: QuestionaryStep[]) {
  return questionarySteps
    .flatMap((questionaryStep) => questionaryStep.fields)
    .flatMap((field) => ({
      key: field.question.naturalKey,
      value: field.value,
    }))
    .reduce((p: Record<string, unknown>, v) => {
      p[v.key] = v.value;

      return p;
    }, {});
}

export const collectExperimentPDFData = async (
  experimentPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ExperimentSafetyPDFData> => {
  const experiment = await baseContext.queries.experiment.getExperiment(
    user,
    experimentPk
  );

  if (experiment === null) {
    throw new Error('Experiment not found');
  }
  // Get Experiment Safety data
  const experimentSafety =
    await baseContext.queries.experiment.getExperimentSafetyByExperimentPk(
      user,
      experimentPk
    );
  if (experimentSafety === null) {
    throw new Error('Experiment safety not found');
  }

  // Get the status of the experiment safety
  const experimentSafetyStatus = await baseContext.queries.status.getStatus(
    user,
    experimentSafety.statusId ?? 0
  );

  const esiQuestionarySteps =
    await baseContext.queries.questionary.getQuestionarySteps(
      user,
      experimentSafety.esiQuestionaryId
    );

  const esiQuestionary = {
    questionarySteps: esiQuestionarySteps ?? [],
    answers: extractAnswerMap(esiQuestionarySteps ?? []),
  };

  if (isRejection(esiQuestionarySteps) || esiQuestionarySteps == null) {
    throw new Error('Could not fetch ESI Questionary');
  }

  const safetyReviewQuestionary: {
    questionarySteps: QuestionaryStep[];
    answers: Record<string, any>;
  } = {
    questionarySteps: [],
    answers: {},
  };

  if (experimentSafety.safetyReviewQuestionaryId) {
    const safetyReviewQuestionarySteps =
      await baseContext.queries.questionary.getQuestionarySteps(
        user,
        experimentSafety.safetyReviewQuestionaryId
      );
    if (
      isRejection(safetyReviewQuestionarySteps) ||
      safetyReviewQuestionarySteps == null
    ) {
      throw new Error('Could not fetch Safety Review Questionary');
    }

    safetyReviewQuestionary.questionarySteps = safetyReviewQuestionarySteps;
    safetyReviewQuestionary.answers = extractAnswerMap(
      safetyReviewQuestionarySteps
    );
  }

  // Get the proposal related to this experiment
  const proposal = await baseContext.queries.proposal.get(
    user,
    experiment.proposalPk
  );

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  // Get the instrument
  const instrument = await baseContext.queries.instrument.get(
    user,
    experiment.instrumentId
  );

  // Get the PDF template (if experiment template is set, otherwise fallback to proposal template)
  const pdfTemplate = await getPdfTemplate(user, experiment);
  // Get the principal investigator
  const principalInvestigator = await baseContext.queries.user.getBasic(
    user,
    proposal.proposerId
  );

  if (!principalInvestigator) {
    throw new Error('Principal investigator not found');
  }

  // Get local contact if assigned
  const localContact = experiment.localContactId
    ? await baseContext.queries.user.getBasic(user, experiment.localContactId)
    : null;

  // Get samples assigned to this experiment
  const experimentSamples =
    await baseContext.queries.experiment.getExperimentSamples(
      user,
      experimentPk
    );

  const sampleAttachments: Attachment[] = [];

  const experimentSamplesPDFData = (
    await Promise.all(
      experimentSamples.map((experimentSample) =>
        collectExperimentSamplePDFData(
          experimentPk,
          experimentSample.sampleId,
          user
        )
      )
    )
  ).map((pdfData) => {
    sampleAttachments.push(...pdfData.attachments);

    return pdfData;
  });

  // Create filename for notification
  notify?.(
    `ESD_${experiment.experimentId}_${experiment.createdAt.getUTCFullYear()}.pdf`
  );

  // Return the experiment PDF data
  return {
    proposal,
    principalInvestigator,
    experiment,
    experimentSafety,
    experimentSafetyStatus,
    esiQuestionary,
    safetyReviewQuestionary,
    instrument,
    localContact,
    experimentSamples: experimentSamplesPDFData,
    attachments: [...sampleAttachments],
    pdfTemplate,
  };
};

// Helper to get the PDF template for the experiment
const getPdfTemplate = async (
  user: UserWithRole,
  experiment: Experiment
): Promise<ExperimentSafetyPdfTemplate | null> => {
  try {
    // If no experiment-specific template, fall back to the proposal's PDF template
    // Get the proposal to find its call
    const proposal = await baseContext.queries.proposal.get(
      user,
      experiment.proposalPk
    );

    if (proposal) {
      const call = await baseContext.queries.call.get(user, proposal.callId);

      // First, try to use the dedicated experiment safety PDF template
      if (call?.experimentSafetyPdfTemplateId) {
        const pdfTemplates =
          await baseContext.queries.experimentSafetyPdfTemplate.getExperimentSafetyPdfTemplates(
            user,
            {
              filter: {
                templateIds: [call.experimentSafetyPdfTemplateId],
              },
            }
          );

        if (pdfTemplates && pdfTemplates.length > 0) {
          return pdfTemplates[0];
        }
      }
    }

    return null;
  } catch (error) {
    logger.logError('Error getting PDF template for experiment', {
      error,
      experimentPk: experiment.experimentPk,
    });

    return null;
  }
};

export const collectExperimentPDFDataTokenAccess = async (
  experimentPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<any> => {
  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  // Get experiment data
  const experiment = await experimentDataSource.getExperiment(experimentPk);

  if (experiment === null) {
    throw new Error('Experiment not found');
  }

  // Get the proposal related to this experiment
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const proposal = await proposalDataSource.get(experiment.proposalPk);

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  // Get the instrument
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const instrument = await instrumentDataSource.getInstrument(
    experiment.instrumentId
  );

  // Get PDF template
  const experimentSafetyPdfTemplateDataSource =
    container.resolve<ExperimentSafetyPdfTemplateDataSource>(
      Tokens.ExperimentSafetyPdfTemplateDataSource
    );

  // Try to get experiment-specific template
  const templateDataSource =
    container.resolve<ExperimentSafetyPdfTemplateDataSource>(
      Tokens.ExperimentSafetyPdfTemplateDataSource
    );

  let pdfTemplate: ExperimentSafetyPdfTemplate | null = null;

  try {
    // Get experiment templates (simplified from the getPdfTemplate helper function)

    const callDataSource = container.resolve<CallDataSource>(
      Tokens.CallDataSource
    );
    const call = await callDataSource.getCall(proposal.callId);

    // First try experiment safety PDF template
    if (call?.experimentSafetyPdfTemplateId) {
      const templates =
        await experimentSafetyPdfTemplateDataSource.getPdfTemplates({
          filter: {
            templateIds: [call.experimentSafetyPdfTemplateId],
          },
        });

      if (templates.length > 0) {
        pdfTemplate = templates[0];
      }
    }
  } catch (error) {
    logger.logError('Error getting PDF template for experiment', {
      error,
      experimentPk,
    });
  }
  // Get the principal investigator and local contact
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const principalInvestigator = await userDataSource.getBasicUserInfo(
    proposal.proposerId
  );

  if (!principalInvestigator) {
    throw new Error('Principal investigator not found');
  }

  const localContact = experiment.localContactId
    ? await userDataSource.getBasicUserInfo(experiment.localContactId)
    : null;

  // Get experiment samples
  const sampleDataSource = container.resolve<SampleDataSource>(
    Tokens.SampleDataSource
  );
  const sampleAttachments: Attachment[] = [];

  // This is a simplified version - would need proper implementation to get experiment samples
  const samples = await sampleDataSource.getSamples({
    filter: { proposalPk: proposal.primaryKey },
  });

  const samplePDFData = (
    await Promise.all(
      samples.map(async (sample) =>
        collectSamplePDFData(
          sample.id,
          user,
          undefined,
          sample,
          await getQuestionary(sample.questionaryId),
          await getSampleQuestionarySteps(sample.questionaryId)
        )
      )
    )
  ).map(({ sample, sampleQuestionaryFields, attachments }) => {
    sampleAttachments.push(...attachments);

    return { sample, sampleQuestionaryFields };
  });

  // Get generic templates
  const genericTemplateAttachments: Attachment[] = [];
  const genericTemplateDataSource =
    container.resolve<GenericTemplateDataSource>(
      Tokens.GenericTemplateDataSource
    );

  const genericTemplates = await genericTemplateDataSource.getGenericTemplates(
    {
      filter: { proposalPk: proposal.primaryKey },
    },
    user
  );

  const genericTemplatePDFData = (
    await Promise.all(
      genericTemplates.map(async (genericTemplate) =>
        collectGenericTemplatePDFData(
          genericTemplate.id,
          user,
          undefined,
          genericTemplate,
          await getQuestionary(genericTemplate.questionaryId),
          await getSampleQuestionarySteps(genericTemplate.questionaryId)
        )
      )
    )
  ).map(
    ({ genericTemplate, genericTemplateQuestionaryFields, attachments }) => {
      genericTemplateAttachments.push(...attachments);

      return { genericTemplate, genericTemplateQuestionaryFields };
    }
  );

  // Create filename for notification
  notify?.(
    `${experiment.experimentId}_${
      principalInvestigator.lastname
    }_${experiment.createdAt.getUTCFullYear()}.pdf`
  );

  return {
    experiment,
    proposal,
    principalInvestigator,
    localContact,
    instrument,
    questionarySteps: [], // This would be populated if there are experiment-specific questionary steps
    attachments: [...sampleAttachments, ...genericTemplateAttachments],
    samples: samplePDFData,
    genericTemplates: genericTemplatePDFData,
    pdfTemplate,
  };
};
