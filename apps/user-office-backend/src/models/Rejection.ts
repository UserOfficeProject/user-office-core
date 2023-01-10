import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

import { ApolloServerAdditionalErrorCodes } from '../utils/utilTypes';

export class Rejection extends GraphQLError {
  constructor(
    public reason: string,
    public context?: {
      code?: ApolloServerErrorCode | ApolloServerAdditionalErrorCodes;
      exception?: Error | unknown;
    }
  ) {
    super(reason, {
      extensions: { code: context?.code, exception: context?.exception },
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
  context?: {
    code?: ApolloServerErrorCode | ApolloServerAdditionalErrorCodes;
    exception?: Error | unknown;
  }
) {
  return new Rejection(reason, context);
}

export function isRejection(value: unknown): value is Rejection {
  return value instanceof Rejection;
}
