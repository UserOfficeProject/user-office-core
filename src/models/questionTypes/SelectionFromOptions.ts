/* eslint-disable @typescript-eslint/camelcase */
import { SelectionFromOptionsConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const selectionFromOptionsDefinition: Question = {
  dataType: DataType.SELECTION_FROM_OPTIONS,
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.SELECTION_FROM_OPTIONS) {
      throw new Error('DataType should be SELECTION_FROM_OPTIONS');
    }

    const config = field.config as SelectionFromOptionsConfig;
    if (config.required && !value) {
      return false;
    }

    if (config.required && value.length === 0) {
      return false;
    }

    if (value.every(val => config.options.includes(val)) !== true) {
      return false;
    }

    return true;
  },
  createBlankConfig: (): SelectionFromOptionsConfig => {
    const config = new SelectionFromOptionsConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.variant = 'radio';
    config.options = [];
    config.isMultipleSelect = false;

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => [],
};
