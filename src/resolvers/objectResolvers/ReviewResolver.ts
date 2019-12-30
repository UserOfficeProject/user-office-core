import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { User } from "../../models/User";
import { ResolverContext } from "../../context";
import { Review } from "../../models/Review";
import { Proposal } from "../../models/Proposal";

@Resolver(() => Review)
export class ReviewResolver {
  @FieldResolver(() => User, { nullable: true })
  async reviewer(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    return context.queries.user.get(context.user, review.reviewerID);
  }

  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, review.proposalID);
  }
}
