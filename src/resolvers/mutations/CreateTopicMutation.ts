import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  Arg
} from "type-graphql";
import { ResolverContext } from "../../context";
import { createResponseWrapper, MutationResultBase } from "../Utils";
import { ProposalTemplate } from "../../models/ProposalModel";

const resultWrapper = createResponseWrapper<ProposalTemplate>("template");

@ObjectType()
class CreateTopicMutationResult extends MutationResultBase {
  @Field({ nullable: true })
  public template: ProposalTemplate;
}

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => CreateTopicMutationResult, { nullable: true })
  createTopic(
    @Arg("sortOrder", () => Int) sortOrder: number,
    @Ctx() context: ResolverContext
  ) {
    return resultWrapper(
      context.mutations.template.createTopic(context.user, sortOrder)
    );
  }
}
