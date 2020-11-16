/* eslint-disable @typescript-eslint/camelcase */
import { DateConfig } from '../../resolvers/types/FieldConfig';
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
  defaultAnswer: '',
};
