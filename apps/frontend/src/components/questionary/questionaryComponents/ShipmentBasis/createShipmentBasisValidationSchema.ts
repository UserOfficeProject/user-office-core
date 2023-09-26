import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const createShipmentBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    const MAX_TITLE_LEN = 150;
    const schema = Yup.object().shape({
      title: Yup.string()
        .max(
          MAX_TITLE_LEN,
          `Please make title at most ${MAX_TITLE_LEN} characters long`
        )
        .required('Title is required'),
      proposalPk: Yup.number().required('Proposal is required'),
      samples: Yup.array().of(Yup.object()),
    });

    return schema;
  };
