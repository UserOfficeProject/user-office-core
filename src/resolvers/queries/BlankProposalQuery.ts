import { Ctx, Query, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../types/Proposal";

@Resolver()
export class BlankProposalQuery {
  @Query(() => Proposal, { nullable: true })
  blankProposal(@Ctx() context: ResolverContext) {
    return context.queries.proposal.getBlank(context.user);
  }
}
