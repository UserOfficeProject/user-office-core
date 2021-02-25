import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { IntervalConfig } from 'generated/sdk';

export const createIntervalValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  const config = answer.config as IntervalConfig;

  let minSchema = Yup.number().transform(value =>
    isNaN(value) ? undefined : value
  );
  let maxSchema = Yup.number().transform(value =>
    isNaN(value) ? undefined : value
  );

  if (config.required) {
    minSchema = minSchema.required('Please fill in');
    maxSchema = maxSchema.required('Please fill in');
  }

  let unitSchema = Yup.string().nullable();

  // available units are specified and the field is required
  if (config.units?.length && config.required) {
    unitSchema = unitSchema.required();
  }

  return Yup.object().shape({
    min: minSchema,
    max: maxSchema,
    unit: unitSchema,
  });
};
