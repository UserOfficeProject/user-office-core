/* eslint-disable @typescript-eslint/camelcase */
import { SelectionFromOptionsConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const selectionFromOptionsDefinition: Question = {
  dataType: DataType.SELECTION_FROM_OPTIONS,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.SELECTION_FROM_OPTIONS) {
      throw new Error('DataType should be SELECTION_FROM_OPTIONS');
    }

    const config = field.config as SelectionFromOptionsConfig;
    if (config.required && !value) {
      return false;
    }

    if (config.required && config.options!.indexOf(value) === -1) {
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

    return config;
  },
  isReadOnly: false,
  defaultAnswer: '',
};
