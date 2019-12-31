import { Arg, Ctx, Int, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { proposalWrap } from "../wrappers/ProposalWrapper";
import { ProposalResponseWrap } from "./../wrappers/ProposalWrapper";

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
