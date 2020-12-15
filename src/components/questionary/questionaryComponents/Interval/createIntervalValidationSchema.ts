import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { IntervalConfig } from 'generated/sdk';

export const createIntervalValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  const config = answer.config as IntervalConfig;

  let schema = Yup.object().shape({
    min: Yup.number().transform(value => (isNaN(value) ? undefined : value)),
    max: Yup.number().transform(value => (isNaN(value) ? undefined : value)),
    unit:
      config.property !== 'unitless'
        ? Yup.string().required('Please specify unit')
        : Yup.string().nullable(),
  });
  if (config.required) {
    schema = schema.shape({
      min: Yup.number()
        .transform(value => (isNaN(value) ? undefined : value))
        .required('Please fill in'),
      max: Yup.number()
        .transform(value => (isNaN(value) ? undefined : value))
        .required('Please fill in'),
    });
  }

  return schema;
};
