import { GraphQLError } from 'graphql';

import { InstrumentPickerConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const instrumentPickerDefinition: Question = {
  dataType: DataType.INSTRUMENT_PICKER,
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.INSTRUMENT_PICKER) {
      throw new GraphQLError('DataType should be INSTRUMENT_PICKER');
    }

    return new Promise((resolve) => resolve(true));
  },
  createBlankConfig: (): InstrumentPickerConfig => {
    const config = new InstrumentPickerConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.variant = 'dropdown';

    return config;
  },
  getDefaultAnswer: () => null,
};
