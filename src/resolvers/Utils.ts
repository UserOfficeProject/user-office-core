import { isRejection, Rejection, rejection } from "../rejection";
import { ObjectType, Field } from "type-graphql";
import { Proposal } from "../models/Proposal";
import { ResolverContext } from "../context";

@ObjectType()
export abstract class AbstractResponseWrap<T> {
  @Field(() => String, { nullable: true })
  public error: string;
  abstract setValue(value: T): void; // Must implement in subclass
}

export function wrapResponse<T>(wrapper: AbstractResponseWrap<T>) {
  return async function(promise: Promise<T | Rejection>) {
    const result = await promise;
    isRejection(result)
      ? (wrapper.error = result.reason)
      : wrapper.setValue(result);
    return wrapper;
  };
}
