import * as Yup from 'yup';

import { countWordsInHtml, sanitizeHtmlAndCleanText } from '../util';

export const richTextInputQuestionValidationSchema = (field: any) => {
  let schema = Yup.string().transform(function (value: string) {
    return sanitizeHtmlAndCleanText(value);
  });

  const config = field.config;

  if (config.required) {
    schema = schema.required('This is a required field');
  }

  if (config.max) {
    schema = schema.max(
      config.max,
      `Value must be at most ${config.max} characters`
    );
  }

  if (config.maxWords != null) {
    schema = schema.test(
      'max-words',
      `Value must be at most ${config.maxWords} words`,
      (_, context) =>
        countWordsInHtml(context.originalValue) <= config.maxWords
    );
  }

  return schema;
};
