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
import { MutationResultBase, createResponseWrapper } from "../Utils";
import { Topic } from "../../models/ProposalModel";

@ObjectType()
class UpdateTopicMutationResult extends MutationResultBase {
  @Field(() => Topic, { nullable: true })
  public topic: Topic;
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

const resultWrapper = createResponseWrapper<Topic>("topic");

@Resolver()
export class UpdateTopicMutation {
  @Mutation(() => UpdateTopicMutationResult, { nullable: true })
  updateTopic(
    @Args() { id, title, isEnabled }: UpdateTopicArgs,
    @Ctx() context: ResolverContext
  ) {
    return resultWrapper(
      context.mutations.template.updateTopic(context.user, id, title, isEnabled)
    );
  }
}
