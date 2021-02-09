import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { RichTextInputConfig } from 'generated/sdk';

export const createRichTextInputValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  let schema = Yup.string();
  const config = answer.config as RichTextInputConfig;

  if (config.required) {
    schema = schema.required(`This is a required field`);
  }

  return schema;
};
