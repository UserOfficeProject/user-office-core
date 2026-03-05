import * as Yup from 'yup';

export const intervalQuestionValidationSchema = (
  field: any,
  NumberValueConstraint: any
) => {
  const config = field.config;

  let minSchema = Yup.number().transform((value) =>
    isNaN(value) ? undefined : value
  );
  let maxSchema = Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(Yup.ref('min'), 'Max must be greater than or equal to min');

  if (config.required) {
    minSchema = minSchema.required('This is a required field');
    maxSchema = maxSchema.required('This is a required field');
  }

  switch (config.numberValueConstraint) {
    case NumberValueConstraint.ONLY_NEGATIVE:
      minSchema = minSchema.negative('Value must be a negative number');
      maxSchema = maxSchema.negative('Value must be a negative number');
      break;

    case NumberValueConstraint.ONLY_POSITIVE:
      minSchema = minSchema.positive('Value must be a positive number');
      maxSchema = maxSchema.positive('Value must be a positive number');
      break;

    case NumberValueConstraint.ONLY_NEGATIVE_INTEGER:
      minSchema = minSchema
        .integer('Value must be negative whole number')
        .negative('Value must be negative whole number');
      maxSchema = maxSchema
        .integer('Value must be negative whole number')
        .negative('Value must be negative whole number');
      break;

    case NumberValueConstraint.ONLY_POSITIVE_INTEGER:
      minSchema = minSchema
        .integer('Value must be positive whole number')
        .positive('Value must be a positive whole number');
      maxSchema = maxSchema
        .integer('Value must be positive whole number')
        .positive('Value must be a positive whole number');
      break;
  }

  let unitSchema = Yup.object().nullable();

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
