import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Float,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewStatus } from '../../models/Review';
import { Review } from '../types/Review';

@ArgsType()
export class UpdateReviewArgs {
  @Field(() => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(() => Float)
  public grade: number;

  @Field(() => ReviewStatus)
  status: ReviewStatus;

  @Field(() => Int)
  public fapID: number;

  @Field(() => Int)
  public questionaryID: number;
}

@Resolver()
export class UpdateReviewMutation {
  @Mutation(() => Review)
  updateReview(
    @Args() args: UpdateReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.updateReview(context.user, args);
  }
}
