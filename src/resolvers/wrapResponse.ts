import { Rejection, isRejection } from '../models/Rejection';
import { getResponseField } from './Decorators';
import { ResponseWrapBase } from './types/CommonWrappers';

export async function wrapResponse(
  executor: Promise<any>,
  ResponseWrapper: new () => ResponseWrapBase
): Promise<ResponseWrapBase | Rejection> {
  const result = await executor;
  const wrapper = new ResponseWrapper();

  const responseFieldName = getResponseField(wrapper);
  if (!responseFieldName) {
    throw new Error(`No response fields found in '${ResponseWrapper.name}'`);
  }
  if (isRejection(result)) {
    wrapper.rejection = result;
  } else {
    (wrapper as any)[responseFieldName] = result;
  }

  return wrapper;
}
