import { logger } from '@user-office-software/duo-logger';
import { IMiddlewareResolver } from 'graphql-middleware/dist/types';

import { isRejection } from '../models/Rejection';
import { ResponseWrapBase } from '../resolvers/types/CommonWrappers';

const rejectionLogger: IMiddlewareResolver = async (
  resolve,
  root,
  args,
  context,
  info
) => {
  const result: ResponseWrapBase = await resolve(root, args, context, info);
  if (isRejection(result?.rejection)) {
    const { reason: error, exception, context } = result.rejection;

    exception
      ? logger.logException(error, exception, context)
      : logger.logError(error, context ?? {});
  }

  return result;
};

export default rejectionLogger;
