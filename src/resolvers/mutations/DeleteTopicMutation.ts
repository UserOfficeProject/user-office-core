import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalTemplateResponseWrap } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class DeleteTopicMutation {
  @Mutation(() => ProposalTemplateResponseWrap, { nullable: true })
  deleteTopic(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteTopic(context.user, id),
      ProposalTemplateResponseWrap
    );
  }
}
