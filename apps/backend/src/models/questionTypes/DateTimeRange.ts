/* eslint-disable quotes */
import { GraphQLError } from 'graphql';
import * as yup from 'yup';

import { DateTimeRangeConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateTimeRangeDefinition: Question<DataType.DATE_TIME_RANGE> = {
  dataType: DataType.DATE_TIME_RANGE,
  validate: (field: QuestionTemplateRelation, value: Date | null) => {
    if (field.question.dataType !== DataType.DATE_TIME_RANGE) {
      throw new GraphQLError('DataType should be of DATE RANGE type');
    }
    const DateTimeRangeValidationSchema = yup.object({
      dateTimeRanges: yup
        .array()
        .of(yup.object({ to: yup.date(), from: yup.date() })),
    });

    return DateTimeRangeValidationSchema.isValid(value);
  },
  createBlankConfig: (): DateTimeRangeConfig => {
    const config = new DateTimeRangeConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.readPermissions = [];

    return config;
  },
  getDefaultAnswer: (relation: QuestionTemplateRelation) => null,
  filterQuery: (queryBuilder, filter) => {
    throw new GraphQLError(`Unsupported comparator ${filter.compareOperator}`);
  },
};
