import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { NumberInputConfig } from 'generated/sdk';

import { IntervalPropertyId } from '../Interval/intervalUnits';

export const createNumberInputValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  const config = answer.config as NumberInputConfig;
  let schema = Yup.object().shape({
    value: Yup.number().transform(value => (isNaN(value) ? undefined : value)),
    unit:
      config.property !== IntervalPropertyId.UNITLESS
        ? Yup.string().required('Please specify unit')
        : Yup.string().nullable(),
  });
  if (config.required) {
    schema = schema.shape({
      value: Yup.number()
        .transform(value => (isNaN(value) ? undefined : value))
        .required('Please fill in'),
    });
  }

  return schema;
};
