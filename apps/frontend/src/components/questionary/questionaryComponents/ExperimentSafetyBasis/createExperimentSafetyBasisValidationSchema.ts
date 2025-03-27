import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

// todo: this needs to be tested
export const createExperimentSafetyBasisValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  () => {
    let schema = Yup.string();
    schema = schema.required(`This is a required field`);

    return schema;
  };
