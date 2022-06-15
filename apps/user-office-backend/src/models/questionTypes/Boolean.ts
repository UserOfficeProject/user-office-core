/* eslint-disable quotes */
import { booleanQuestionValidationSchema } from '@user-office-software/duo-validation';

import { BooleanConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const booleanDefinition: Question = {
  dataType: DataType.BOOLEAN,
  validate: (field: QuestionTemplateRelation, value: boolean) => {
    if (field.question.dataType !== DataType.BOOLEAN) {
      throw new Error('DataType should be BOOLEAN');
    }

    return booleanQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): BooleanConfig => {
    const config = new BooleanConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';

    return config;
  },
  getDefaultAnswer: () => false,
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw("answers.answer->>'value'=?", value);
      default:
        throw new Error(
          `Unsupported comparator for Boolean ${filter.compareOperator}`
        );
    }
  },
};
