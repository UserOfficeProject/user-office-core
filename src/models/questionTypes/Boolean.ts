/* eslint-disable @typescript-eslint/camelcase */
import { BooleanConfig } from '../../resolvers/types/FieldConfig';
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
};
