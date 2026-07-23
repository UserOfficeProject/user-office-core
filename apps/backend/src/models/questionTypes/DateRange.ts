/* eslint-disable quotes */
import { GraphQLError } from 'graphql';
import * as Yup from 'yup';

import { DateRangeConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

//TODO add validation script to duo-validation
export const dateRangeQuestionValidationSchema = (answer: any) => {
  const config = answer.config;
  let dateRangeSchema = Yup.array()
    .of(
      Yup.object({
        from: Yup.date().required(),
        to: Yup.date().required(),
      })
    )
    .required();
  if (config.required) {
    dateRangeSchema = dateRangeSchema.min(1, 'A daterange is reqruired');
  }

  return Yup.object({ dateRanges: dateRangeSchema });
};

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
