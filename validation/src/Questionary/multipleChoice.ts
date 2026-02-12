import * as Yup from 'yup';

export const multipleChoiceValidationSchema = (field: any) => {
  const config = field.config;

  let schema = Yup.array();

  if (config.required) {
    schema = schema.test({
      message: 'This field is required',
      test: (arr) => Array.isArray(arr) && arr.length > 0,
    });
  }

  const availableOptions = config.options;
  schema = schema.test({
    message: 'Input contains invalid values',
    test: (arr) =>
      Array.isArray(arr) && arr.every((val) => availableOptions.includes(val)),
  });

  return schema;
};
