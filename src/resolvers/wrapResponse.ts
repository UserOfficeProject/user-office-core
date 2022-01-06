import { logger } from '@user-office-software/duo-logger';

import { Rejection, isRejection } from '../models/Rejection';
import { getResponseField } from './Decorators';
import { ResponseWrapBase } from './types/CommonWrappers';

export async function wrapResponse(
  executor: Promise<any>,
  ResponseWrapper: new () => ResponseWrapBase
): Promise<ResponseWrapBase | Rejection> {
  const wrapper = new ResponseWrapper();

  try {
    const result = await executor;
    const responseFieldName = getResponseField(wrapper);
    if (!responseFieldName) {
      throw new Error(`No response fields found in '${ResponseWrapper.name}'`);
    }
    if (isRejection(result)) {
      wrapper.rejection = result;
    } else {
      (wrapper as any)[responseFieldName] = result;
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    logger.logError(errorMessage, { e });
    wrapper.rejection = new Rejection(errorMessage);
  }

  return wrapper;
}
