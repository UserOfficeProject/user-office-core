import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import {
  getAllFields,
  areDependenciesSatisfied,
} from '../../models/ProposalModelFunctions';
import { Answer, Questionary, QuestionaryStep } from '../../models/Questionary';
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
  notify?: CallableFunction,
  newSample?: Sample,
  newQuestionary?: Questionary,
  newQuestionarySteps?: QuestionaryStep[]
): Promise<SamplePDFData> {
  const sample =
    newSample || (await baseContext.queries.sample.getSample(user, sampleId));
  if (!sample) {
    throw new Error(
      `Sample with ID '${sampleId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`sample_${sample.id}.pdf`);

  const questionary =
    newQuestionary ||
    (await baseContext.queries.questionary.getQuestionary(
      user,
      sample.questionaryId
    ));

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${sample.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const questionarySteps =
    newQuestionarySteps ||
    (await baseContext.queries.questionary.getQuestionarySteps(
      user,
      sample.questionaryId
    ));

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

export async function collectSamplePDFDataTokenAccess(
  sampleId: number,
  notify?: CallableFunction,
  newSample?: Sample,
  newQuestionary?: Questionary,
  newQuestionarySteps?: QuestionaryStep[]
): Promise<SamplePDFData> {
  const sampleDataSource = container.resolve<SampleDataSource>(
    Tokens.SampleDataSource
  );

  const sample = newSample || (await sampleDataSource.getSample(sampleId));
  if (!sample) {
    throw new Error(`Sample with ID '${sampleId}' not found`);
  }

  notify?.(`sample_${sample.id}.pdf`);

  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const questionary =
    newQuestionary ||
    (await questionaryDataSource.getQuestionary(sample.questionaryId));

  if (!questionary) {
    throw new Error(`Questionary with ID '${sample.questionaryId}' not found`);
  }

  const questionarySteps =
    newQuestionarySteps ||
    (await questionaryDataSource.getQuestionarySteps(sample.questionaryId));

  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${sample.questionaryId}' not found`
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
