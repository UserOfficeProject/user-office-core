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
import { ReviewResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AddUserForReviewArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public sepID: number;
}

@Resolver()
export class AddUserForReviewMutation {
  @Mutation(() => ReviewResponseWrap)
  addUserForReview(
    @Args() args: AddUserForReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.addUserForReview(context.user, args),
      ReviewResponseWrap
    );
  }
}
