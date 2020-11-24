/* eslint-disable @typescript-eslint/camelcase */
import { IntervalConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const intervalDefinition: Question = {
  dataType: DataType.INTERVAL,
  isReadOnly: false,
  getDefaultAnswer: field => {
    return {
      min: '',
      max: '',
      unit: (field.config as IntervalConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { min: number; max: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.INTERVAL) {
      throw new Error('DataType should be INTERVAL');
    }
    const config = field.config as IntervalConfig;
    if (config.required && !value) {
      return false;
    }

    if (isNaN(value.min) || isNaN(value.max)) {
      return false;
    }

    return true;
  },
  createBlankConfig: (): IntervalConfig => {
    const config = new IntervalConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.property = '';
    config.units = [];

    return config;
  },
};
