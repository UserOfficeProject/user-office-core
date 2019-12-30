import { Query, Ctx, Resolver, Arg, Int } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
@Resolver()
export class ProposalQuery {
  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return await context.queries.proposal.get(context.user, id);
  }
}
