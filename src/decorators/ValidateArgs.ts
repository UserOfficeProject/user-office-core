import { ResourceId } from '@esss-swap/duo-localisation';
import * as yup from 'yup';

import { Rejection, rejection } from '../rejection';
import { User } from '../resolvers/types/User';

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
      value?: (agent: User | null, args: any) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const [, inputArgs] = args;

      const errors = await schemaValidation(schema, inputArgs);

      if (errors) {
        // NOTE: Add BAD_REQUEST in the duo-localisation
        return rejection('BAD_REQUEST' as ResourceId);
      }

      const result = await originalMethod?.apply(this, args);

      return result;
    };
  };
};

export default ValidateArgs;
