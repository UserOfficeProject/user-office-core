import sanitizeHtml from 'sanitize-html';
import * as Yup from 'yup';

import { sanitizerConfig } from '../models/questionTypes/RichTextInput';
import { Rejection, rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';

const schemaValidation = async (schema: Yup.ObjectSchema, inputArgs: any) => {
  try {
    await schema.validate(inputArgs, { abortEarly: false });
  } catch (error) {
    return error;
  }

  return null;
};

const ValidateArgs = (schema: Yup.ObjectSchema, sanitizeInput?: string[]) => {
  return (
    target: any,
    name: string,
    descriptor: {
      value?: (
        agent: UserWithRole | null,
        args: any
      ) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const [, inputArgs] = args;

      // NOTE: Sanitize dangerous html inputs if needed.
      if (sanitizeInput && sanitizeInput.length > 0) {
        sanitizeInput.forEach((inputArg) => {
          inputArgs[inputArg] = sanitizeHtml(
            inputArgs[inputArg],
            sanitizerConfig
          );
        });
      }

      const errors = await schemaValidation(schema, inputArgs);

      if (errors) {
        return rejection('Input validation errors', {
          errors: errors.errors,
          inputArgs,
        });
      }

      return await originalMethod?.apply(this, args);
    };
  };
};

export default ValidateArgs;
