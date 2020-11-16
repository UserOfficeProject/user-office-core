import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig } from 'generated/sdk';

export const createDateValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  let schema = Yup.date();
  const config = answer.config as DateConfig;
  config.required && (schema = schema.required(`This date is required`));

  return schema;
};
