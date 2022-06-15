/* eslint-disable quotes */
import { textInputQuestionValidationSchema } from '@user-office-software/duo-validation';

import { ConfigBase, TextInputConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const textInputDefinition: Question = {
  dataType: DataType.TEXT_INPUT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.TEXT_INPUT) {
      throw new Error('DataType should be TEXT_INPUT');
    }

    return textInputQuestionValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): ConfigBase => {
    const config = new TextInputConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';
    config.htmlQuestion = '';
    config.isHtmlQuestion = false;
    config.min = null;
    config.max = null;
    config.multiline = false;
    config.placeholder = '';
    config.isCounterHidden = false;

    return config;
  },
  getDefaultAnswer: () => '',
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw("answers.answer->>'value'=?", value);
      case QuestionFilterCompareOperator.INCLUDES:
        return queryBuilder.andWhereRaw("answers.answer->>'value' like ?", [
          `%${value}%`,
        ]);
      default:
        throw new Error(
          `Unsupported comparator for TextInput ${filter.compareOperator}`
        );
    }
  },
};
