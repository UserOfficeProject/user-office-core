import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { BooleanConfig } from 'generated/sdk';

export const createBooleanValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = (
  answer
) => {
  let schema = Yup.bool();

  const config = answer.config as BooleanConfig;
  config.required &&
    (schema = schema
      .oneOf([true], 'This field is required')
      .required('This field is required'));

  return schema;
};
