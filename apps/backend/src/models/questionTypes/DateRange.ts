/* eslint-disable quotes */
import { dateQuestionValidationSchema } from '@user-office-software/duo-validation';
import { GraphQLError } from 'graphql';

import { DateRangeConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateRangeDefinition: Question<DataType.DATE_RANGE_PICKER> = {
  dataType: DataType.DATE_RANGE_PICKER,
  validate: (field: QuestionTemplateRelation, value: Date | null) => {
    if (field.question.dataType !== DataType.DATE_RANGE_PICKER) {
      throw new GraphQLError('DataType should be list of DATE RANGE');
    }

    return dateQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): DateRangeConfig => {
    const config = new DateRangeConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.readPermissions = [];
    config.defaultDate = null;

    return config;
  },
  getDefaultAnswer: (relation: QuestionTemplateRelation) =>
    (relation.config as DateRangeConfig).defaultDate || null,
  filterQuery: (queryBuilder, filter) => {
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return true;
      case QuestionFilterCompareOperator.GREATER_THAN:
        return true;
      case QuestionFilterCompareOperator.LESS_THAN:
        return true;
      default:
        throw new GraphQLError(
          `Unsupported comparator for TextInput ${filter.compareOperator}`
        );
    }
  },
};
