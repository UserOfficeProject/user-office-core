import {
  Ctx,
  Field,
  FieldResolver,
  Float,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Review as ReviewOrigin, ReviewStatus } from '../../models/Review';
import { Proposal } from '../types/Proposal';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class Review implements Partial<ReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public userID: number;

  @Field({ nullable: true })
  public comment?: string;

  @Field(() => Float, { nullable: true })
  public grade?: number;

  @Field(() => ReviewStatus)
  public status: ReviewStatus;

  public proposalPk: number;

  @Field(() => Int)
  public sepID: number;
}

@Resolver(() => Review)
export class ReviewResolver {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async reviewer(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, review.userID);
  }

  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, review.proposalPk);
  }
}
