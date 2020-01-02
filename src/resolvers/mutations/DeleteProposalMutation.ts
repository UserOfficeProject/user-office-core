import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalResponseWrap } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";

@Resolver()
export class DeleteProposalMutation {
  @Mutation(() => ProposalResponseWrap, { nullable: true })
  deleteProposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.delete(context.user, id),
      ProposalResponseWrap
    );
  }
}
