import { ResourceId } from '@esss-swap/duo-localisation';
import * as yup from 'yup';

import { UserWithRole } from '../models/User';
import { Rejection, rejection } from '../rejection';

const schemaValidation = async (schema: yup.ObjectSchema, inputArgs: any) => {
  try {
    await schema.validate(inputArgs, { abortEarly: false });
  } catch (error) {
    return error;
  }

  return null;
};

const ValidateArgs = (schema: yup.ObjectSchema) => {
  return (
    target: object,
    name: string,
    descriptor: {
      value?: (
        agent: UserWithRole | null,
        args: any
      ) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const [, inputArgs] = args;

      const errors = await schemaValidation(schema, inputArgs);

      console.log(errors);

      if (errors) {
        // NOTE: Add BAD_REQUEST in the duo-localisation
        return rejection('BAD_REQUEST' as ResourceId);
      }

      return await originalMethod?.apply(this, args);
    };
  };
};

export default ValidateArgs;
