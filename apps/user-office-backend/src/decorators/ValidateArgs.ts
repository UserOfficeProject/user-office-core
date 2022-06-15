/* eslint-disable @typescript-eslint/no-explicit-any */
import sanitizeHtml from 'sanitize-html';
import * as Yup from 'yup';

import { sanitizerConfig } from '../models/questionTypes/RichTextInput';
import { Rejection, rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';

const schemaValidation = async (
  schema: Yup.AnyObjectSchema,
  inputArgs: unknown
): Promise<any> => {
  try {
    await schema.validate(inputArgs, { abortEarly: false });
  } catch (error) {
    return error;
  }

  return null;
};

const ValidateArgs = (
  schema: Yup.AnyObjectSchema,
  sanitizeInput?: string[]
) => {
  return (
    target: unknown,
    name: string,
    descriptor: {
      value?: (
        agent: UserWithRole | null,
        args: any
      ) => Promise<Rejection | unknown>;
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
