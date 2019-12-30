import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { Proposal } from "../../models/Proposal";
import { BasicUserDetails } from "../../models/User";
import { ResolverContext } from "../../context";
import { isRejection } from "../../rejection";
import { Review } from "../../models/Review";
import { Questionary } from "../../models/ProposalModel";

@Resolver(of => Proposal)
export class ProposalResolver {
  @FieldResolver(() => [BasicUserDetails])
  async users(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[]> {
    const users = await context.queries.user.getProposers(
      context.user,
      proposal.id
    );
    return isRejection(users) ? [] : users;
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async proposer(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return await context.queries.user.getBasic(
      context.user,
      proposal.proposerId
    );
  }

  @FieldResolver(() => [Review])
  async reviews(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Review[]> {
    const reviews = await context.queries.review.reviewsForProposal(
      context.user,
      proposal.id
    );
    return isRejection(reviews) ? [] : reviews;
  }

  @FieldResolver(() => Questionary, { nullable: true })
  async questionary(
    @Root() proposal: Proposal,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    const questionary = await context.queries.proposal.getQuestionary(
      context.user,
      proposal.id
    );
    return isRejection(questionary) ? null : questionary;
  }
}
