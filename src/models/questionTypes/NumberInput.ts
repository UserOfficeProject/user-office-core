/* eslint-disable quotes */
import * as Yup from 'yup';

import {
  NumberInputConfig,
  NumberValueConstraint,
} from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const numberInputDefinition: Question = {
  dataType: DataType.NUMBER_INPUT,
  isReadOnly: false,
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

    const config = field.config as NumberInputConfig;

    let valueScheme = Yup.number().transform((value) =>
      isNaN(value) ? undefined : value
    );

    if (config.required) {
      valueScheme = valueScheme.required();
    }

    if (config.numberValueConstraint === NumberValueConstraint.ONLY_NEGATIVE) {
      valueScheme = valueScheme.negative();
    }

    if (config.numberValueConstraint === NumberValueConstraint.ONLY_POSITIVE) {
      valueScheme = valueScheme.positive();
    }

    let unitScheme = Yup.string().nullable();

    // available units are specified and the field is required
    if (config.units?.length && config.required) {
      unitScheme = unitScheme.required('Please specify unit');
    }

    return Yup.object()
      .shape({
        value: valueScheme,
        unit: unitScheme,
      })
      .isValidSync(value);
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
