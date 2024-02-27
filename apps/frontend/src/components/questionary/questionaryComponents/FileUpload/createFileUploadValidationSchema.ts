import * as Yup from 'yup';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { FileUploadConfig } from 'generated/sdk';

export const createFileUploadValidationSchema: QuestionaryComponentDefinition['createYupValidationSchema'] =
  (answer) => {
    const config = answer.config as FileUploadConfig;
    let schema = Yup.array();
    if (config.required) {
      schema = schema.min(1, `Please upload a file.`);
    }

    return schema;
  };
