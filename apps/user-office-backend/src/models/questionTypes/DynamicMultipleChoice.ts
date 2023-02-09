/* eslint-disable quotes */
import { textInputQuestionValidationSchema } from '@user-office-software/duo-validation';

import { DynamicMultipleChoiceConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

//TODO: include url validation in validate field

export const dynamicMultipleChoiceDefinition: Question = {
  dataType: DataType.DYNAMIC_MULTIPLE_CHOICE,
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.DYNAMIC_MULTIPLE_CHOICE) {
      throw new Error('DataType should be DYNAMIC_MULTIPLE_CHOICE');
    }

    return textInputQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): DynamicMultipleChoiceConfig => {
    const config = new DynamicMultipleChoiceConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';
    config.variant = 'input';
    config.url = '';
    config.min = null;
    config.max = null;
    config.multiline = false;
    config.placeholder = '';

    return config;
  },
  getDefaultAnswer: () => [],
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.INCLUDES:
        /* 
        "\\?" is escaping question mark for JSONB lookup 
        (read more here https://www.postgresql.org/docs/9.5/functions-json.html),  
        but "?" is used for binding 
        */
        return queryBuilder.andWhereRaw(
          "(answers.answer->>'value')::jsonb \\? ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
        );
    }
  },
};
