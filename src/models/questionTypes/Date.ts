/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable quotes */
import * as Yup from 'yup';

import { DateConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

function normalizeDate(date: Date) {
  date.setHours(12);
  date.setMinutes(0);
  date.setMilliseconds(0);

  return date;
}

export const dateDefinition: Question = {
  dataType: DataType.DATE,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.DATE) {
      throw new Error('DataType should be DATE');
    }

    let scheme = Yup.date().transform(function(value: Date) {
      return normalizeDate(value);
    });

    const config = field.config as DateConfig;

    if (config.required) {
      scheme = scheme.required();
    }

    if (config.minDate) {
      const minDate = normalizeDate(new Date(config.minDate));
      scheme = scheme.min(minDate);
    }

    if (config.maxDate) {
      const maxDate = normalizeDate(new Date(config.maxDate));
      scheme = scheme.max(maxDate);
    }

    return scheme.isValidSync(value);
  },
  createBlankConfig: (): DateConfig => {
    const config = new DateConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => '',
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw("answers.answer->>'value'=?", value);
      case QuestionFilterCompareOperator.GREATER_THAN:
        return queryBuilder.andWhereRaw(
          "(answer->>'value')::timestamp > (?)::timestamp",
          value
        );
      case QuestionFilterCompareOperator.LESS_THAN:
        return queryBuilder.andWhereRaw(
          "(answer->>'value')::timestamp < (?)::timestamp",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for TextInput ${filter.compareOperator}`
        );
    }
  },
};
