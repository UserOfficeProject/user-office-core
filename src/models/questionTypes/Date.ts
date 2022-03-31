/* eslint-disable quotes */
import { dateQuestionValidationSchema } from '@user-office-software/duo-validation';
import { DateTime } from 'luxon';

import { DateConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateDefinition: Question = {
  dataType: DataType.DATE,
  validate: (field: QuestionTemplateRelation, value: Date | null) => {
    if (field.question.dataType !== DataType.DATE) {
      throw new Error('DataType should be DATE');
    }

    return dateQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): DateConfig => {
    const config = new DateConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.includeTime = false;

    return config;
  },
  getDefaultAnswer: (relation: QuestionTemplateRelation) =>
    (relation.config as DateConfig).defaultDate || null,
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    // NOTE: For exact comparison we need to use like interval of whole day because for now filter works only with date without time.
    const valuePlusOneDay = DateTime.fromISO(value, { zone: 'utc' })
      .plus({ day: 1 })
      .toISO();

    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder
          .andWhereRaw("(answer->>'value')::timestamp >= (?)::timestamp", value)
          .andWhereRaw(
            "(answer->>'value')::timestamp < (?)::timestamp",
            valuePlusOneDay
          );
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
