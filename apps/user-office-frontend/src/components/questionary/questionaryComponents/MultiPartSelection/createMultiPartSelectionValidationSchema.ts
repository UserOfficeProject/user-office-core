import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const createMultiPartSelectionValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () =>
    Yup.object().shape({
      partOneAnswer: Yup.string(),
      partTwoAnswer: Yup.string(),
    });
