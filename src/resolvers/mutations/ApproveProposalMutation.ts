import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalResponseWrap, proposalWrap } from "../Wrappers";

@Resolver()
export class ApproveProposalMutation {
  @Mutation(() => ProposalResponseWrap, { nullable: true })
  approveProposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    proposalWrap(context.mutations.proposal.accept(context.user, id));
  }
}
