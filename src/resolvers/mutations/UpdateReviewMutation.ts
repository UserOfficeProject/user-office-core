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
import { ReviewWithNextStatusResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateReviewArgs {
  @Field(() => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(() => Int)
  public grade: number;

  @Field(() => ReviewStatus)
  status: ReviewStatus;

  @Field(() => Int)
  public sepID: number;
}

@Resolver()
export class UpdateReviewMutation {
  @Mutation(() => ReviewWithNextStatusResponseWrap)
  updateReview(
    @Args() args: UpdateReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.updateReview(context.user, args),
      ReviewWithNextStatusResponseWrap
    );
  }
}
