/* eslint-disable @typescript-eslint/camelcase */
import { ConfigBase, TextInputConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const textInputDefinition: Question = {
  dataType: DataType.TEXT_INPUT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.TEXT_INPUT) {
      throw new Error('DataType should be TEXT_INPUT');
    }
    const config = field.question.config as TextInputConfig;
    if (config.required && !value) {
      return false;
    }

    if (config.min && value && value.length < config.min) {
      return false;
    }
    if (config.max && value && value.length > config.max) {
      return false;
    }

    return true;
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

    return config;
  },
  isReadOnly: false,
  defaultAnswer: '',
};
