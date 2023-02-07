import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

import { omit } from '../utils/helperFunctions';
import { ApolloServerAdditionalErrorCodes } from '../utils/utilTypes';

export class Rejection extends GraphQLError {
  constructor(
    public reason: string,
    public context: Record<string, unknown> & {
      code?: ApolloServerErrorCode | ApolloServerAdditionalErrorCodes;
      /**
       * NOTE: https://www.apollographql.com/docs/apollo-server/data/errors/#setting-http-status-code-and-headers
       * GraphQL, by design, does not use the same conventions from REST to communicate via HTTP verbs and status codes.
       * Client information should be contained in the schema or as part of the standard response errors field.
       * If you still want to change the HTTP status code and response headers based on an error thrown in either a resolver or context function
       * there is a way to do so by throwing a rejection with an http extension, like so:
       * rejection('error message', {
          code: ApolloServerErrorCodeExtended.NOT_FOUND,
          http: {
            status: 404,
            headers: new Map([
              ['some-header', 'it was bad'],
              ['another-header', 'seriously'],
            ]),
          },
        });
      */
      http?: { code: number; headers: Map<string, string> };
    } = {},
    public exception?: Error | unknown
  ) {
    super(reason, {
      extensions: {
        code: context.code,
        http: context.http,
        // NOTE: omit 'code' and 'http' properties so we don't have duplicates because they are already present in extensions.
        context: omit(context, 'code', 'http'),
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
      return `${this.context.exception.name}: ${this.context.exception.message}`;
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
