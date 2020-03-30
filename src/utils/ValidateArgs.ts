import { createMethodDecorator, NextFn, ArgsDictionary } from 'type-graphql';
import * as yup from 'yup';

import { ResponseWrapBase } from '../resolvers/types/CommonWrappers';

const schemaValidation = async (
  schema: yup.Schema<any>,
  input: ArgsDictionary
) => {
  try {
    await schema.validate(input, { abortEarly: false });
  } catch (error) {
    return error;
  }

  return null;
};

export const ValidateArgs = (schema: yup.Schema<any>) => {
  return createMethodDecorator(
    async ({ args }: { args: ArgsDictionary }, next: NextFn) => {
      const errors = await schemaValidation(schema, args);

      if (errors) {
        const wrapper = new ResponseWrapBase();
        wrapper.error = 'BAD_REQUEST';

        return wrapper;
      }

      return next();
    }
  );
};
