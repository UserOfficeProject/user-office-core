import * as Yup from 'yup';

import { CreateYupValidation } from 'components/questionary/QuestionaryComponentRegistry';

export const createProposalEsiBasisValidationSchema: CreateYupValidation =
  () => {
    let schema = Yup.array().of(
      Yup.object({ isEsiSubmitted: Yup.boolean().required() })
    );

    schema = schema.test(
      'allESIsCompleted',
      'All experiment safety inputs must be completed',
      (value) => {
        return (
          value?.every(
            (experimentSample) => experimentSample?.isEsiSubmitted
          ) ?? false
        );
      }
    );

    return schema;
  };
