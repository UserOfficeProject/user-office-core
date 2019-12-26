import { isRejection, Rejection } from "../rejection";
import { ObjectType, Field } from "type-graphql";

export function createResponseWrapper<T>(key: string) {
  return async function(promise: Promise<T | Rejection>) {
    const result = await promise;
    if (isRejection(result)) {
      return {
        [key]: null,
        error: result.reason
      };
    } else {
      return {
        [key]: result,
        error: null
      };
    }
  };
}

@ObjectType()
export class MutationResultBase {
  @Field(() => String, { nullable: true })
  public error: String;
}
