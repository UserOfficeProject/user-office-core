import { Ctx, FieldResolver, Resolver, Root } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
import { Review } from "../../models/Review";
import { User } from "../types/User";

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
