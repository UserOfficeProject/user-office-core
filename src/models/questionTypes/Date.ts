/* eslint-disable @typescript-eslint/camelcase */
import { DateConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const dateDefinition: Question = {
  dataType: DataType.DATE,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.DATE) {
      throw new Error('DataType should be DATE');
    }
    const config = field.config as DateConfig;
    if (config.required && !value) {
      return false;
    }

    return true;
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
        return queryBuilder.andWhereRaw(`answers.answer->>'value'='${value}'`);
      case QuestionFilterCompareOperator.GREATER_THAN:
        return queryBuilder.andWhereRaw(
          `(answer->>'value')::timestamp > ('${value}')::timestamp`
        );
      case QuestionFilterCompareOperator.LESS_THAN:
        return queryBuilder.andWhereRaw(
          `(answer->>'value')::timestamp < ('${value}')::timestamp`
        );
      default:
        throw new Error(
          `Unsupported comparator for TextInput ${filter.compareOperator}`
        );
    }
  },
};
