import * as Yup from 'yup';

export const booleanQuestionValidationSchema = (field: any) => {
  let schema = Yup.bool();

  const config = field.config;
  config.required &&
    (schema = schema
      .oneOf([true], 'This field is required')
      .required('This field is required'));

  return schema;
};
