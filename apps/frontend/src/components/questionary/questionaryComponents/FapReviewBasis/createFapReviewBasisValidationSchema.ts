import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const createFapReviewBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    const schema = Yup.object().shape({});

    //@TODO add validation for user, comment length (?)

    return schema;
  };