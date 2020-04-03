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

@ObjectType()
export class TechnicalReview implements Partial<TechnicalReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalID: number;

  @Field(() => String, { nullable: true })
  public comment: string;

  @Field(() => String, { nullable: true })
  public publicComment: string;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus;
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
      technicalReview.proposalID
    );
  }
}
