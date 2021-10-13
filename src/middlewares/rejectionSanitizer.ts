import { IMiddlewareResolver } from 'graphql-middleware/dist/types';

import { isRejection } from '../models/Rejection';
import { ResponseWrapBase } from '../resolvers/types/CommonWrappers';

/**
 * This middleware removes fields from rejection, that could potentially
 * contain sensitive data or technical information not intended for users
 */
const rejectionSanitizer: IMiddlewareResolver = async (
  resolve,
  root,
  args,
  context,
  info
) => {
  const result: ResponseWrapBase = await resolve(root, args, context, info);
  const rejection = result?.rejection;

  if (isRejection(rejection)) {
    delete rejection.context;
    delete rejection.exception;
  }

  return result;
};

export default rejectionSanitizer;
