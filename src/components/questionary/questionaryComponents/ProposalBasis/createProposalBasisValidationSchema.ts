import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const createProposalBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] = answer => {
  const MAX_TITLE_LEN = 175;
  const MAX_ABSTRACT_LEN = 1500;

  const schema = Yup.object().shape({
    title: Yup.string()
      .max(
        MAX_TITLE_LEN,
        `Please make abstract at most ${MAX_TITLE_LEN} characters long`
      )
      .required('Title is required'),
    abstract: Yup.string()
      .max(
        MAX_ABSTRACT_LEN,
        `Please make abstract at most ${MAX_ABSTRACT_LEN} characters long`
      )
      .required('Abstract is required'),
  });

  return schema;
};
