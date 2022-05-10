import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  TechnicalReview as TechnicalReviewOrigin,
  TechnicalReviewStatus,
} from '../../models/TechnicalReview';
import { Proposal } from '../types/Proposal';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class TechnicalReview implements Partial<TechnicalReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public comment: string | null;

  @Field(() => String, { nullable: true })
  public publicComment: string | null;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number | null;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus | null;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int)
  public reviewerId: number;

  @Field(() => String, { nullable: true })
  public files: string | null;

  @Field(() => Int, { nullable: true })
  public technicalReviewAssigneeId: number | null;
}

@Resolver(() => TechnicalReview)
export class TechnicalReviewResolver {
  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() technicalReview: TechnicalReview,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(
      context.user,
      technicalReview.proposalPk
    );
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async reviewer(
    @Root() technicalReview: TechnicalReview,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(
      context.user,
      technicalReview.reviewerId
    );
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async technicalReviewAssignee(
    @Root() technicalReview: TechnicalReview,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return technicalReview.technicalReviewAssigneeId
      ? context.queries.user.getBasic(
          context.user,
          technicalReview.technicalReviewAssigneeId
        )
      : null;
  }
}
