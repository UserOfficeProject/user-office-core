import { Rejection, isRejection } from "../rejection";
import { ResponseWrapBase } from "./Wrappers";
import { getResponseField } from "./Decorators";

export async function wrapResponse<T>(
  executor: Promise<T | Rejection>,
  ResponseWrapper: new () => ResponseWrapBase<T>
): Promise<ResponseWrapBase<T>> {
  const result = await executor;
  const wrapper = new ResponseWrapper();

  const responseFieldName = getResponseField(wrapper);
  if (responseFieldName) {
    isRejection(result)
      ? (wrapper.error = result.reason)
      : ((wrapper as any)[responseFieldName] = result);
  } else {
    wrapper.error = `No response fields found in '${ResponseWrapper.name}'`;
    console.error(wrapper.error); // print out for easier debugging, most likely missing @Response() decorator
  }

  return wrapper;
}
