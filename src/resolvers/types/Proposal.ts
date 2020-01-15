import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal as ProposalOrigin } from "../../models/Proposal";

import { isRejection } from "../../rejection";
import { ProposalStatus } from "../../models/ProposalModel";
import { Questionary } from "./Questionary";
import { Review } from "./Review";
import { BasicUserDetails } from "./BasicUserDetails";

@ObjectType()
export class Proposal implements Partial<ProposalOrigin> {
  @Field(() => Int, { nullable: true })
  public id: number;

  @Field(() => String, { nullable: true })
  public title: string;

  @Field(() => String, { nullable: true })
  public abstract: string;

  @Field(() => Int)
  public status: ProposalStatus;

  @Field(() => Date, { nullable: true })
  public created: Date;

  @Field(() => Date, { nullable: true })
  public updated: Date;

  @Field(() => String, { nullable: true })
  public shortCode: string;

  public proposerId: number;
}

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

  @FieldResolver(() => BasicUserDetails)
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

  @FieldResolver(() => Questionary)
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
