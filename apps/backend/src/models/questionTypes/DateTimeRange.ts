/* eslint-disable quotes */
import { dateTimeRangeQuestionValidationSchema } from '@user-office-software/duo-validation';
import { GraphQLError } from 'graphql';

import { DateTimeRangeConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateTimeRangeDefinition: Question<DataType.DATE_TIME_RANGE_PICKER> =
  {
    dataType: DataType.DATE_TIME_RANGE_PICKER,
    validate: (field: QuestionTemplateRelation, value: Date | null) => {
      if (field.question.dataType !== DataType.DATE_TIME_RANGE_PICKER) {
        throw new GraphQLError('DataType should be of DATE RANGE type');
      }

      return dateTimeRangeQuestionValidationSchema(field).isValid(value);
    },
    createBlankConfig: (): DateTimeRangeConfig => {
      const config = new DateTimeRangeConfig();
      config.small_label = '';
      config.required = false;
      config.tooltip = '';
      config.readPermissions = [];
      config.includeTime = false;

      return config;
    },
    getDefaultAnswer: (relation: QuestionTemplateRelation) => null,
    filterQuery: (queryBuilder, filter) => {
      throw new GraphQLError(
        `Unsupported comparator ${filter.compareOperator}`
      );
    },
  };
