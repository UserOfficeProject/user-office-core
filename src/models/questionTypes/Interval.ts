import * as Yup from 'yup';

import { IntervalConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const intervalDefinition: Question = {
  dataType: DataType.INTERVAL,
  isReadOnly: false,
  getDefaultAnswer: (field) => {
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

    let minSchema = Yup.number().transform((value) =>
      isNaN(value) ? undefined : value
    );
    let maxSchema = Yup.number().transform((value) =>
      isNaN(value) ? undefined : value
    );

    if (config.required) {
      minSchema = minSchema.required();
      maxSchema = maxSchema.required();
    }

    let unitSchema = Yup.string().nullable();

    // available units are specified and the field is required
    if (config.units?.length && config.required) {
      unitSchema = unitSchema.required();
    }

    return Yup.object()
      .shape({
        min: minSchema,
        max: maxSchema,
        unit: unitSchema,
      })
      .isValidSync(value);
  },
  createBlankConfig: (): IntervalConfig => {
    const config = new IntervalConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.units = [];

    return config;
  },
};
