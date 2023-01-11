import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

import { omit } from '../utils/helperFunctions';
import { ApolloServerAdditionalErrorCodes } from '../utils/utilTypes';

export class Rejection extends GraphQLError {
  constructor(
    public reason: string,
    public context: Record<string, unknown> & {
      code?: ApolloServerErrorCode | ApolloServerAdditionalErrorCodes;
    } = {},
    public exception?: Error | unknown
  ) {
    super(reason, {
      extensions: {
        code: context.code,
        context: omit(context, 'code'),
        exception: exception,
      },
    });
  }

  // TODO: Check if this is really needed.
  get contextStr() {
    return JSON.stringify(this.context);
  }

  get exceptionStr() {
    if (this.context?.exception instanceof Error) {
      return `${this.context?.exception.name}: ${this.context?.exception.message}`;
    }

    return JSON.stringify(this.context?.exception);
  }
}

export function rejection(
  reason: string,
  context?: Record<string, unknown> & {
    code?: ApolloServerErrorCode | ApolloServerAdditionalErrorCodes;
  },
  exception?: Error | unknown
) {
  return new Rejection(reason, context, exception);
}

export function isRejection(value: unknown): value is Rejection {
  return value instanceof Rejection;
}
