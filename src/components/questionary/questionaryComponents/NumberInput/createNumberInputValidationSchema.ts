import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { NumberInputConfig, NumberValueConstraint } from 'generated/sdk';

export const createNumberInputValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  const config = answer.config as NumberInputConfig;

  let valueSchema = Yup.number().transform(value =>
    isNaN(value) ? undefined : value
  );

  if (config.required) {
    valueSchema = valueSchema.required('Please fill in');
  }

  if (config.numberValueConstraint === NumberValueConstraint.ONLY_NEGATIVE) {
    valueSchema = valueSchema.negative('Value must be a negative number');
  }

  if (config.numberValueConstraint === NumberValueConstraint.ONLY_POSITIVE) {
    valueSchema = valueSchema.positive('Value must be a positive number');
  }

  let unitScheme = Yup.string().nullable();

  // available units are specified and the field is required
  if (config.units?.length && config.required) {
    unitScheme = unitScheme.required('Please specify unit');
  }

  return Yup.object().shape({
    value: valueSchema,
    unit: unitScheme,
  });
};
