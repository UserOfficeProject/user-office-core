import { ResourceId } from '@esss-swap/duo-localisation';
import { logger } from '@esss-swap/duo-logger';
import * as Yup from 'yup';

import { UserWithRole } from '../models/User';
import { Rejection, rejection } from '../rejection';

const schemaValidation = async (schema: Yup.ObjectSchema, inputArgs: any) => {
  try {
    await schema.validate(inputArgs, { abortEarly: false });
  } catch (error) {
    return error;
  }

  return null;
};

const ValidateArgs = (schema: Yup.ObjectSchema) => {
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

      const errors = await schemaValidation(schema, inputArgs);

      if (errors) {
        if (process.env.NODE_ENV === 'development') {
          logger.logError(`Input validation errors: ${errors}`, {
            errors: errors.errors,
            inputArgs,
          });
        }

        // NOTE: Add BAD_REQUEST in the duo-localisation
        return rejection('BAD_REQUEST' as ResourceId);
      }

      return await originalMethod?.apply(this, args);
    };
  };
};

export default ValidateArgs;
