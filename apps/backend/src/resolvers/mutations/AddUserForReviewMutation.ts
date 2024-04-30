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
import { Review } from '../types/Review';

@ArgsType()
export class AddUserForReviewArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public fapID: number;
}

@Resolver()
export class AddUserForReviewMutation {
  @Mutation(() => Review)
  addUserForReview(
    @Args() args: AddUserForReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.addUserForReview(context.user, args);
  }
}
