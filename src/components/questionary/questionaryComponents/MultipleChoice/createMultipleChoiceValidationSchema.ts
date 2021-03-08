import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { SelectionFromOptionsConfig } from 'generated/sdk';

export const createMultipleChoiceValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = (
  answer
) => {
  let schema = Yup.string();
  const config = answer.config as SelectionFromOptionsConfig;
  config.required && (schema = schema.required(`This is a required field`));

  return schema;
};
