import {
  Args,
  ArgsType,
  Ctx,
  Field,
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

  @Field(() => String)
  public grade: string;

  @Field(() => ReviewStatus)
  public status: ReviewStatus;

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
