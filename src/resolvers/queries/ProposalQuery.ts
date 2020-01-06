import { Query, Ctx, Resolver, Arg, Int } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../types/Proposal";
@Resolver()
export class ProposalQuery {
  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, id);
  }
}
