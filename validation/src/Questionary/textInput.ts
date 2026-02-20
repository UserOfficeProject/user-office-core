import * as Yup from 'yup';

export const textInputQuestionValidationSchema = (field: any) => {
  let schema = Yup.string().nullable();
  const config = field.config;
  config.required && (schema = schema.required('This is a required field'));

  if (config.min) {
    schema = schema.test(
      'min',
      `Value must be at least ${config.min} characters`,
      (value) => {
        if (!value || value.length === 0) return true;

        return value.length >= config.min;
      }
    );
  }

  config.max &&
    (schema = schema.max(
      config.max,
      `Value must be at most ${config.max} characters`
    ));

  return schema;
};
