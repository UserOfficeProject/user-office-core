/* eslint-disable quotes */
import { numberInputQuestionValidationSchema } from '@esss-swap/duo-validation';

import {
  NumberInputConfig,
  NumberValueConstraint,
} from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const numberInputDefinition: Question = {
  dataType: DataType.NUMBER_INPUT,
  getDefaultAnswer: (field) => {
    return {
      value: '',
      unit: (field.config as NumberInputConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { value: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.NUMBER_INPUT) {
      throw new Error('DataType should be NUMBER_INPUT');
    }

    return numberInputQuestionValidationSchema(
      field,
      NumberValueConstraint
    ).isValidSync(value);
  },
  createBlankConfig: (): NumberInputConfig => {
    const config = new NumberInputConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.units = [];

    return config;
  },
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.LESS_THAN:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'value')::float < ?",
          value
        );
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'value')::float = ?",
          value
        );
      case QuestionFilterCompareOperator.GREATER_THAN:
        return queryBuilder.andWhereRaw(
          "(answers.answer->'value'->>'value')::float > ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for NumberInput ${filter.compareOperator}`
        );
    }
  },
};
