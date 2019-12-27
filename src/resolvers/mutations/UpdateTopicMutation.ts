import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";
import { Topic } from "../../models/ProposalModel";

@ObjectType()
class UpdateTopicMutationResult extends AbstractResponseWrap<Topic> {
  @Field(() => Topic, { nullable: true })
  public topic: Topic;

  setValue(value: Topic): void {
    this.topic = value;
  }
}

@ArgsType()
class UpdateTopicArgs {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;
}

const wrap = wrapResponse<Topic>(new UpdateTopicMutationResult());

@Resolver()
export class UpdateTopicMutation {
  @Mutation(() => UpdateTopicMutationResult)
  updateTopic(
    @Args() { id, title, isEnabled }: UpdateTopicArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.updateTopic(context.user, id, title, isEnabled)
    );
  }
}
