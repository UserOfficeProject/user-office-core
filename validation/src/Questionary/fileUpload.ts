import * as Yup from 'yup';

export const fileUploadQuestionValidationSchema = (answer: any) => {
  const config = answer.config;
  let schema = Yup.array();
  if (config.required) {
    schema = schema.min(1, 'Please upload a file.');
  }
  if (config.max_files) {
    schema = schema.max(config.max_files, `Max ${config.max} files`);
  }

  return schema;
};
