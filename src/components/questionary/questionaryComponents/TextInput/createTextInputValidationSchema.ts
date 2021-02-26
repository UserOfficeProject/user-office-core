import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';

export const createTextInputValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = (
  answer
) => {
  let schema = Yup.string();
  const config = answer.config as TextInputConfig;
  config.required && (schema = schema.required(`This is a required field`));
  config.min &&
    (schema = schema.min(
      config.min,
      `Value must be at least ${config.min} characters`
    ));
  config.max &&
    (schema = schema.max(
      config.max,
      `Value must be at most ${config.max} characters`
    ));

  return schema;
};
