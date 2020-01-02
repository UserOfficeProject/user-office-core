import { Rejection, isRejection } from "../rejection";
import { ResponseWrapBase } from "./Wrappers";
import { getResponseField } from "./Decorators";

export async function wrapResponse<T>(
  executor: Promise<T | Rejection>,
  ResponseWrapper: new () => ResponseWrapBase
): Promise<ResponseWrapBase> {
  const result = await executor;
  const wrapper = new ResponseWrapper();

  const responseFieldName = getResponseField(wrapper);
  if (responseFieldName) {
    isRejection(result)
      ? (wrapper.error = result.reason)
      : ((wrapper as any)[responseFieldName] = result);
  } else {
    wrapper.error = "Failed to wrap response";
  }

  return wrapper;
}
