import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { GenericTemplate } from '../../models/GenericTemplate';
import {
  getAllFields,
  areDependenciesSatisfied,
} from '../../models/ProposalModelFunctions';
import { Answer, Questionary, QuestionaryStep } from '../../models/Questionary';
import { UserWithRole } from '../../models/User';
import { getFileAttachments, Attachment } from '../util';

export type GenericTemplatePDFData = {
  genericTemplate: GenericTemplate;
  genericTemplateQuestionaryFields: Answer[];
  attachments: Attachment[];
};

export async function collectGenericTemplatePDFData(
  genericTemplateId: number,
  user: UserWithRole,
  notify?: CallableFunction,
  newGenericTemplate?: GenericTemplate,
  newQuestionary?: Questionary,
  newQuestionarySteps?: QuestionaryStep[]
): Promise<GenericTemplatePDFData> {
  const genericTemplate =
    newGenericTemplate ||
    (await baseContext.queries.genericTemplate.getGenericTemplate(
      user,
      genericTemplateId
    ));
  if (!genericTemplate) {
    throw new Error(
      `GenericTemplate with ID '${genericTemplateId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`genericTemplate_${genericTemplate.id}.pdf`);

  const questionary =
    newQuestionary ||
    (await baseContext.queries.questionary.getQuestionary(
      user,
      genericTemplate.questionaryId
    ));

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${genericTemplate.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const questionarySteps =
    newQuestionarySteps ||
    (await baseContext.queries.questionary.getQuestionarySteps(
      user,
      genericTemplate.questionaryId
    ));

  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${genericTemplate.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const completedFields = (getAllFields(questionarySteps) as Answer[]).filter(
    (field) => areDependenciesSatisfied(questionarySteps, field.question.id)
  );

  const attachments: Attachment[] = [];

  completedFields.forEach((answer) => {
    attachments.push(...getFileAttachments(answer));
  });
  const out: GenericTemplatePDFData = {
    genericTemplate: {
      ...genericTemplate,
    },
    genericTemplateQuestionaryFields: completedFields,
    attachments,
  };

  return out;
}

export async function collectGenericTemplatePDFDataTokenAccess(
  genericTemplateId: number,
  notify?: CallableFunction,
  newGenericTemplate?: GenericTemplate,
  newQuestionary?: Questionary,
  newQuestionarySteps?: QuestionaryStep[]
): Promise<GenericTemplatePDFData> {
  const genericTemplateDataSource =
    container.resolve<GenericTemplateDataSource>(
      Tokens.GenericTemplateDataSource
    );

  const genericTemplate =
    newGenericTemplate ||
    (await genericTemplateDataSource.getGenericTemplate(genericTemplateId));
  if (!genericTemplate) {
    throw new Error(`GenericTemplate with ID '${genericTemplateId}' not found`);
  }

  notify?.(`genericTemplate_${genericTemplate.id}.pdf`);

  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const questionary =
    newQuestionary ||
    (await questionaryDataSource.getQuestionary(genericTemplate.questionaryId));

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${genericTemplate.questionaryId}' not found`
    );
  }

  const questionarySteps =
    newQuestionarySteps ||
    (await questionaryDataSource.getQuestionarySteps(
      genericTemplate.questionaryId
    ));

  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${genericTemplate.questionaryId}' not found`
    );
  }

  const completedFields = (getAllFields(questionarySteps) as Answer[]).filter(
    (field) => areDependenciesSatisfied(questionarySteps, field.question.id)
  );

  const attachments: Attachment[] = [];

  completedFields.forEach((answer) => {
    attachments.push(...getFileAttachments(answer));
  });
  const out: GenericTemplatePDFData = {
    genericTemplate: {
      ...genericTemplate,
    },
    genericTemplateQuestionaryFields: completedFields,
    attachments,
  };

  return out;
}
