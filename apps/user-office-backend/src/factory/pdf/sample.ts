import baseContext from '../../buildContext';
import {
  getAllFields,
  areDependenciesSatisfied,
} from '../../models/ProposalModelFunctions';
import { Answer } from '../../models/Questionary';
import { Sample, SampleStatus } from '../../models/Sample';
import { UserWithRole } from '../../models/User';
import { getFileAttachments, Attachment } from '../util';

export type SamplePDFData = {
  sample: Sample & { status: string };
  sampleQuestionaryFields: Answer[];
  attachments: Attachment[];
};

const getHumanReadableStatus = (safetyStatus: SampleStatus): string => {
  switch (safetyStatus) {
    case SampleStatus.PENDING_EVALUATION:
      return 'Not evaluated';
    case SampleStatus.LOW_RISK:
      return 'Low risk';
    case SampleStatus.ELEVATED_RISK:
      return 'Elevated risk';
    case SampleStatus.HIGH_RISK:
      return 'High risk';
    default:
      return `Unknown status: ${safetyStatus}`;
  }
};

export async function collectSamplePDFData(
  sampleId: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<SamplePDFData> {
  const sample = await baseContext.queries.sample.getSample(user, sampleId);
  if (!sample) {
    throw new Error(
      `Sample with ID '${sampleId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`sample_${sample.id}.pdf`);

  const questionary = await baseContext.queries.questionary.getQuestionary(
    user,
    sample.questionaryId
  );

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${sample.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const questionarySteps =
    await baseContext.queries.questionary.getQuestionarySteps(
      user,
      sample.questionaryId
    );

  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${sample.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const completedFields = (getAllFields(questionarySteps) as Answer[]).filter(
    (field) => areDependenciesSatisfied(questionarySteps, field.question.id)
  );

  const attachments: Attachment[] = [];

  completedFields.forEach((answer) => {
    attachments.push(...getFileAttachments(answer));
  });

  const status = getHumanReadableStatus(sample.safetyStatus);

  const out: SamplePDFData = {
    sample: {
      ...sample,
      status, //  human readable version of status
    },
    sampleQuestionaryFields: completedFields,
    attachments,
  };

  return out;
}
