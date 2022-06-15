/* eslint-disable quotes */
import { multipleChoiceValidationSchema } from '@user-office-software/duo-validation';

import { SelectionFromOptionsConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const selectionFromOptionsDefinition: Question = {
  dataType: DataType.SELECTION_FROM_OPTIONS,
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.SELECTION_FROM_OPTIONS) {
      throw new Error('DataType should be SELECTION_FROM_OPTIONS');
    }

    return multipleChoiceValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): SelectionFromOptionsConfig => {
    const config = new SelectionFromOptionsConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.variant = 'radio';
    config.options = [];
    config.isMultipleSelect = false;

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
