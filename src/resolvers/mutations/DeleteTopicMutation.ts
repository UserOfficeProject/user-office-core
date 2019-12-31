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
import { Topic } from "./../../models/ProposalModel";

@ObjectType()
class DeleteTopicResponseWrap extends AbstractResponseWrap<Topic> {
  @Field(() => Topic)
  public template: Topic;

  setValue(value: Topic): void {
    this.template = value;
  }
}

const wrap = wrapResponse<Topic>(new DeleteTopicResponseWrap());

@Resolver()
export class DeleteTopicMutation {
  @Mutation(() => DeleteTopicResponseWrap, { nullable: true })
  deleteTopic(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.template.deleteTopic(context.user, id));
  }
}
