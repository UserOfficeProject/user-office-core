import baseContext from '../../buildContext';
import { GenericTemplate } from '../../models/GenericTemplate';
import {
  getAllFields,
  areDependenciesSatisfied,
} from '../../models/ProposalModelFunctions';
import { Answer } from '../../models/Questionary';
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
  notify?: CallableFunction
): Promise<GenericTemplatePDFData> {
  const genericTemplate =
    await baseContext.queries.genericTemplate.getGenericTemplate(
      user,
      genericTemplateId
    );
  if (!genericTemplate) {
    throw new Error(
      `GenericTemplate with ID '${genericTemplateId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`genericTemplate_${genericTemplate.id}.pdf`);

  const questionary = await baseContext.queries.questionary.getQuestionary(
    user,
    genericTemplate.questionaryId
  );

  if (!questionary) {
    throw new Error(
      `Questionary with ID '${genericTemplate.questionaryId}' not found, or the user has insufficient rights`
    );
  }

  const questionarySteps =
    await baseContext.queries.questionary.getQuestionarySteps(
      user,
      genericTemplate.questionaryId
    );

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
