import * as Yup from 'yup';

import { CreateYupValidation } from 'components/questionary/QuestionaryComponentRegistry';

export const createProposalEsiBasisValidationSchema: CreateYupValidation =
  () => {
    return Yup.array().of<Yup.AnyObjectSchema>(Yup.object());
  };
