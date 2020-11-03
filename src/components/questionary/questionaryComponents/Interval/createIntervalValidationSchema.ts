import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { IntervalConfig } from 'generated/sdk';

export const createIntervalValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  return Yup.object().shape({
    min: Yup.number()
      .transform(value => (isNaN(value) ? undefined : value))
      .required('This field is required'),
    max: Yup.number()
      .transform(value => (isNaN(value) ? undefined : value))
      .required('This field is required'),
    unit:
      (answer.config as IntervalConfig).property !== 'unitless'
        ? Yup.string().required('Please specify unit')
        : Yup.string().nullable(),
  });
};
