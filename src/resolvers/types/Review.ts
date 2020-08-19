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
import { Review as ReviewOrigin, ReviewStatus } from '../../models/Review';
import { Proposal } from '../types/Proposal';
import { User } from '../types/User';

@ObjectType()
export class Review implements Partial<ReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public userID: number;

  @Field({ nullable: true })
  public comment?: string;

  @Field(() => Int, { nullable: true })
  public grade?: number;

  @Field(() => ReviewStatus)
  public status: ReviewStatus;

  public proposalID: number;

  @Field(() => Int)
  public sepID: number;
}

@Resolver(() => Review)
export class ReviewResolver {
  @FieldResolver(() => User, { nullable: true })
  async reviewer(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<User | null> {
    return context.queries.user.get(context.user, review.userID);
  }

  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, review.proposalID);
  }
}
