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
import { TechnicalReview } from '../types/TechnicalReview';

@ArgsType()
export class UpdateTechnicalReviewAssigneeInput {
  @Field(() => Int)
  public userId: number;

  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => Int)
  public instrumentId: number;
}

@Resolver()
export class UpdateTechnicalReviewAssigneeMutation {
  @Mutation(() => [TechnicalReview])
  async updateTechnicalReviewAssignee(
    @Args() args: UpdateTechnicalReviewAssigneeInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.updateTechnicalReviewAssignee(
      context.user,
      args
    );
  }
}
