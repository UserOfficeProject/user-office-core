import baseContext from '../../buildContext';
import { ExperimentHasSample } from '../../models/Experiment';
import {
  getAllFields,
  areDependenciesSatisfied,
} from '../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { Sample } from '../../models/Sample';
import { UserWithRole } from '../../models/User';
import { getFileAttachments, Attachment } from '../util';
import { extractAnswerMap } from './experimentSafety';

export type ExperimentSamplePDFData = {
  experimentSample: ExperimentHasSample;
  sample: Sample;
  sampleESIQuestionary: {
    questionarySteps: QuestionaryStep[];
    answers: Record<string, any>;
  };
  attachments: Attachment[];
};

export async function collectExperimentSamplePDFData(
  experimentPk: number,
  sampleId: number,
  user: UserWithRole
): Promise<ExperimentSamplePDFData> {
  const experimentSample =
    await baseContext.queries.experiment.getExperimentSample(user, {
      experimentPk,
      sampleId,
    });
  if (!experimentSample) {
    throw new Error(
      `Sample with ID '${sampleId}' does not exist together with the Experiment with PK '${experimentPk}', or the user has insufficient rights`
    );
  }

  const sample = await baseContext.queries.sample.getSample(
    user,
    experimentSample.sampleId
  );
  if (!sample) {
    throw new Error(
      `Sample with ID '${experimentSample.sampleId}' not found, or the user has insufficient rights`
    );
  }

  const sampleESIQuestionary: {
    questionarySteps: QuestionaryStep[];
    answers: Record<string, any>;
  } = {
    questionarySteps: [],
    answers: {},
  };

  const sampleESIQuestionarySteps =
    await baseContext.queries.questionary.getQuestionarySteps(
      user,
      experimentSample.sampleEsiQuestionaryId
    );

  if (!sampleESIQuestionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${experimentSample.sampleEsiQuestionaryId}' not found, or the user has insufficient rights`
    );
  }

  sampleESIQuestionary.questionarySteps = sampleESIQuestionarySteps;
  sampleESIQuestionary.answers = extractAnswerMap(sampleESIQuestionarySteps);

  const sampleESIQuestionaryCompletedFields = (
    getAllFields(sampleESIQuestionarySteps) as Answer[]
  ).filter((field) =>
    areDependenciesSatisfied(sampleESIQuestionarySteps, field.question.id)
  );

  const attachments: Attachment[] = [];

  sampleESIQuestionaryCompletedFields.forEach((answer) => {
    attachments.push(...getFileAttachments(answer));
  });

  return {
    experimentSample,
    sample,
    sampleESIQuestionary,
    attachments,
  };
}
