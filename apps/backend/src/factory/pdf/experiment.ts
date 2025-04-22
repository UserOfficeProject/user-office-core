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
import { DownloadOptions } from '../../middlewares/factory/factoryServices';
import { Experiment } from '../../models/Experiment';
import { Instrument } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { QuestionaryStep } from '../../models/Questionary';
import { Sample } from '../../models/Sample';
import { TemplateGroupId } from '../../models/Template';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { ExperimentSafetyPdfTemplate } from '../../resolvers/types/ExperimentSafetyPdfTemplate';
import { Attachment } from '../util';
import {
  collectGenericTemplatePDFData,
  GenericTemplatePDFData,
} from './genericTemplates';
import { collectSamplePDFData, SamplePDFData } from './sample';

export type ExperimentPDFData = {
  experiment: Experiment;
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  localContact: BasicUserDetails | null;
  instrument: Instrument | null;
  questionarySteps: QuestionaryStep[];
  attachments: Attachment[];
  samples: Array<Pick<SamplePDFData, 'sample' | 'sampleQuestionaryFields'>>;
  genericTemplates: Array<
    Pick<
      GenericTemplatePDFData,
      'genericTemplate' | 'genericTemplateQuestionaryFields'
    >
  >;
  pdfTemplate: ExperimentSafetyPdfTemplate | null;
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

export const collectExperimentPDFData = async (
  experimentPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ExperimentPDFData> => {
  const experiment = await baseContext.queries.experiment.getExperiment(
    user,
    experimentPk
  );

  if (experiment === null) {
    throw new Error('Experiment not found');
  }

  // Get the proposal related to this experiment
  const proposal = await baseContext.queries.proposal.get(
    user,
    experiment.proposalPk
  );

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  // Get experiment safety information if available
  const experimentSafety =
    await baseContext.queries.experiment.getExperimentSafety(
      user,
      experimentPk
    );

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
  const sampleIds = experimentSamples.map((es) => es.sampleId);
  const samples = await Promise.all(
    sampleIds.map((id) => baseContext.queries.sample.getSample(user, id))
  );
  const validSamples = samples.filter((s): s is Sample => s !== null);

  const samplePDFData = (
    await Promise.all(
      validSamples.map((sample) => collectSamplePDFData(sample.id, user))
    )
  ).map(({ sample, sampleQuestionaryFields, attachments }) => {
    sampleAttachments.push(...attachments);

    return { sample, sampleQuestionaryFields };
  });

  // Get generic templates related to the proposal
  const genericTemplateAttachments: Attachment[] = [];
  const genericTemplates =
    await baseContext.queries.genericTemplate.getGenericTemplates(user, {
      filter: { proposalPk: proposal.primaryKey },
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

  // Create filename for notification
  notify?.(
    `${experiment.experimentId}_${
      principalInvestigator.lastname
    }_${experiment.createdAt.getUTCFullYear()}.pdf`
  );

  // Return the experiment PDF data
  return {
    experiment,
    proposal,
    principalInvestigator,
    localContact,
    instrument,
    questionarySteps: [], // This will be populated if there are experiment-specific questionary steps
    attachments: [...sampleAttachments, ...genericTemplateAttachments],
    samples: samplePDFData,
    genericTemplates: genericTemplatePDFData,
    pdfTemplate,
  };
};

// Helper to get the PDF template for the experiment
const getPdfTemplate = async (
  user: UserWithRole,
  experiment: Experiment
): Promise<ExperimentSafetyPdfTemplate | null> => {
  try {
    // First try to get an experiment-specific PDF template
    const experimentTemplates = await baseContext.queries.template.getTemplates(
      user,
      {
        filter: {
          group: TemplateGroupId.EXPERIMENT_SAFETY_PDF_TEMPLATE,
          isArchived: false,
        },
      }
    );

    if (experimentTemplates && experimentTemplates.length > 0) {
      // Use the first available experiment PDF template
      const experimentPdfTemplateId = experimentTemplates[0].templateId;

      const pdfTemplates =
        await baseContext.queries.experimentSafetyPdfTemplate.getExperimentSafetyPdfTemplates(
          user,
          {
            filter: {
              templateIds: [experimentPdfTemplateId],
            },
          }
        );

      if (pdfTemplates && pdfTemplates.length > 0) {
        return pdfTemplates[0];
      }
    }

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

      // If no experiment safety template is available, fall back to the proposal PDF template
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
  options?: DownloadOptions,
  notify?: CallableFunction
): Promise<ExperimentPDFData> => {
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
    const experimentTemplates =
      await experimentSafetyPdfTemplateDataSource.getPdfTemplates({
        filter: {
          pdfTemplateData: 'EXPERIMENT_PDF_TEMPLATE', // This is a simplification, would need proper filtering
        },
      });

    if (experimentTemplates.length > 0) {
      pdfTemplate = experimentTemplates[0];
    } else {
      // Fallback to proposal PDF template
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
      // Then fall back to proposal PDF template
      else if (call?.proposalPdfTemplateId) {
        const templates =
          await experimentSafetyPdfTemplateDataSource.getPdfTemplates({
            filter: {
              templateIds: [call.proposalPdfTemplateId],
            },
          });

        if (templates.length > 0) {
          pdfTemplate = templates[0];
        }
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
