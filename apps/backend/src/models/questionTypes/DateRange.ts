/* eslint-disable quotes */
import { dateRangeQuestionValidationSchema } from '@user-office-software/duo-validation';
import { GraphQLError } from 'graphql';

import { DateRangeConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateRangeDefinition: Question<DataType.DATE_RANGE_PICKER> = {
  dataType: DataType.DATE_RANGE_PICKER,
  validate: (field: QuestionTemplateRelation, value: Date | null) => {
    if (field.question.dataType !== DataType.DATE_RANGE_PICKER) {
      throw new GraphQLError('DataType should be of DATE RANGE type');
    }

    return dateRangeQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): DateRangeConfig => {
    const config = new DateRangeConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.readPermissions = [];
    config.includeTime = false;

    return config;
  },
  getDefaultAnswer: (relation: QuestionTemplateRelation) => null,
  filterQuery: (queryBuilder, filter) => {
    throw new GraphQLError(`Unsupported comparator ${filter.compareOperator}`);
  },
};
