import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class UpdateTopicOrderResponseWrap extends AbstractResponseWrap<number[]> {
  @Field(() => [Int], { nullable: true })
  public topicOrder: number[];

  setValue(value: number[]): void {
    this.topicOrder = value;
  }
}
const wrap = wrapResponse<number[]>(new UpdateTopicOrderResponseWrap());

@Resolver()
export class UpdateTopicOrderMutation {
  @Mutation(() => UpdateTopicOrderResponseWrap, { nullable: true })
  updateTopicOrder(
    @Arg("topicOrder", () => [Int]) topicOrder: number[],
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.updateTopicOrder(context.user, topicOrder)
    );
  }
}
