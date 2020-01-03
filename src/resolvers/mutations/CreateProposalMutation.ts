import { Ctx, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { wrapResponse } from "../wrapResponse";
import { ProposalResponseWrap } from "../types/CommonWrappers";

@Resolver()
export class CreateProposalMutation {
  @Mutation(() => ProposalResponseWrap, { nullable: true })
  createProposal(@Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.proposal.create(context.user),
      ProposalResponseWrap
    );
  }
}
