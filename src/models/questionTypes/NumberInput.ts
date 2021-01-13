/* eslint-disable @typescript-eslint/camelcase */
import { NumberInputConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const numberInputDefinition: Question = {
  dataType: DataType.NUMBER_INPUT,
  isReadOnly: false,
  getDefaultAnswer: field => {
    return {
      value: '',
      unit: (field.config as NumberInputConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { value: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.NUMBER_INPUT) {
      throw new Error('DataType should be NUMBER_INPUT');
    }
    const config = field.config as NumberInputConfig;
    if (config.required && !value) {
      return false;
    }

    if (isNaN(value.value)) {
      return false;
    }

    return true;
  },
  createBlankConfig: (): NumberInputConfig => {
    const config = new NumberInputConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.property = '';
    config.units = [];

    return config;
  },
};
