import { SafeString } from 'handlebars';

import { FullProposalPDFData } from './proposal';
import { Answer } from '../../models/Questionary';
import { DataType } from '../../models/Template';

/**
 * Builds the `answers` object PDF templates use to reach an answer by its
 * question's natural key, instead of walking `questionarySteps`.
 *
 * Ported from the factory service so templates written against it keep working.
 */

type ValueExtractor = (data: FullProposalPDFData, answer: Answer) => unknown;

type GenericTemplateAnswer = {
  questionaryId: number;
  questionId: string;
};

function formatDate(answer: Answer): string {
  const date = new Date(answer.value);
  const day = date.toISOString().split('T')[0];

  return answer.config && 'includeTime' in answer.config
    ? `${day} ${date.toLocaleTimeString()}`
    : day;
}

function extractGenericTemplateAnswers(
  data: FullProposalPDFData,
  answer: Answer
): Record<string, unknown>[] {
  return (answer.value as GenericTemplateAnswer[])
    .map((value) =>
      data.genericTemplates.find(
        (candidate) =>
          candidate.genericTemplate.questionaryId === value.questionaryId &&
          candidate.genericTemplate.questionId === value.questionId
      )
    )
    .filter(
      (template): template is FullProposalPDFData['genericTemplates'][number] =>
        template !== undefined
    )
    .map((template) =>
      template.genericTemplateQuestionaryFields.reduce(
        (fields: Record<string, unknown>, field) => {
          if (field.question.dataType === DataType.GENERIC_TEMPLATE_BASIS) {
            fields['generic_template_basis'] = template.genericTemplate.title;
          } else {
            fields[field.question.naturalKey] = extractValue(
              field.question.dataType
            )(data, field);
          }

          return fields;
        },
        {}
      )
    );
}

function extractValue(dataType: string): ValueExtractor {
  switch (dataType) {
    case DataType.GENERIC_TEMPLATE:
      return extractGenericTemplateAnswers;
    case DataType.RICH_TEXT_INPUT:
      return (_, answer) => new SafeString(answer.value);
    case DataType.DATE:
      return (_, answer) => formatDate(answer);
    default:
      return (_, answer) => answer.value;
  }
}

/** Maps every answer in the proposal to its question's natural key. */
export function extractAnswerMap(
  data: FullProposalPDFData
): Record<string, unknown> {
  return data.questionarySteps
    .flatMap((step) => step.fields)
    .reduce((answers: Record<string, unknown>, answer) => {
      answers[answer.question.naturalKey] = extractValue(
        answer.question.dataType
      )(data, answer);

      return answers;
    }, {});
}
