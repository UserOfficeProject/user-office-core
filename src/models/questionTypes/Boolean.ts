/* eslint-disable @typescript-eslint/camelcase */
import { BooleanConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const booleanDefinition: Question = {
  dataType: DataType.BOOLEAN,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.BOOLEAN) {
      throw new Error('DataType should be BOOLEAN');
    }

    const config = field.config as BooleanConfig;
    if (config.required && !value) {
      return false;
    }

    return true;
  },
  createBlankConfig: (): BooleanConfig => {
    const config = new BooleanConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => false,
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw(`answers.answer->>'value'='${value}'`);
      default:
        throw new Error(
          `Unsupported comparator for Boolean ${filter.compareOperator}`
        );
    }
  },
};
