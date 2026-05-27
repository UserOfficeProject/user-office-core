import * as Yup from 'yup';

export const numberInputQuestionValidationSchema = (
  field: any,
  NumberValueConstraint: any
) => {
  const config = field.config;

  let valueScheme = Yup.number().transform((value: any) =>
    isNaN(value) ? undefined : value
  );

  if (config.required) {
    valueScheme = valueScheme.required('This is a required field');
  }

  switch (config.numberValueConstraint) {
    case NumberValueConstraint.ONLY_NEGATIVE:
      valueScheme = valueScheme.negative('Value must be a negative number');
      break;

    case NumberValueConstraint.ONLY_POSITIVE:
      valueScheme = valueScheme.positive('Value must be a positive number');
      break;

    case NumberValueConstraint.ONLY_NEGATIVE_INTEGER:
      valueScheme = valueScheme
        .integer('Value must be negative whole number')
        .negative('Value must be negative whole number');
      break;

    case NumberValueConstraint.ONLY_POSITIVE_INTEGER:
      valueScheme = valueScheme
        .integer('Value must be positive whole number')
        .positive('Value must be a positive whole number');
      break;
  }

  if (config.numberMin !== null) {
    valueScheme = config.numberMinInclusive
      ? valueScheme.min(
          config.numberMin,
          `Value must be greater than or equal to ${config.numberMin}`,
        )
      : valueScheme.moreThan(
          config.numberMin,
          `Value must be greater than ${config.numberMin}`,
        );
  }

  if (config.numberMax !== null) {
    valueScheme = config.numberMaxInclusive
      ? valueScheme.max(
          config.numberMax,
          `Value must be less than or equal to ${config.numberMax}`,
        )
      : valueScheme.lessThan(
          config.numberMax,
          `Value must be less than ${config.numberMax}`,
        );
  }


  let unitScheme = Yup.object().nullable();

  // available units are specified and the field is required
  if (config.units?.length && config.required) {
    unitScheme = unitScheme.required('Please specify unit');
  }

  return Yup.object().shape({
    value: valueScheme,
    unit: unitScheme,
  });
};
