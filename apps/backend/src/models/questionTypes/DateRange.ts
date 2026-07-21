/* eslint-disable quotes */
import { GraphQLError } from 'graphql';
import * as Yup from 'yup';

import { DateRangeConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

//TODO add validation script to duo-validation
const dateRangeQuestionValidationSchema = (field: QuestionTemplateRelation) =>
  Yup.object({
    dateRanges: Yup.array()
      .of(
        Yup.object({
          from: Yup.date().required(),
          to: Yup.date().required(),
        })
      )
      .required(),
  });

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
