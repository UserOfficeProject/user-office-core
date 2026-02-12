import * as Yup from 'yup';

export const dynamicMultipleChoiceValidationSchema = (field: any) => {
  const config = field.config;

  let schema = Yup.array();

  if (config.required) {
    schema = schema.test({
      message: 'This field is required',
      test: (arr) => Array.isArray(arr) && arr.length > 0,
    });
  }

  return schema;
};
