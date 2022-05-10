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
import { TechnicalReviewsResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateTechnicalReviewAssigneeInput {
  @Field(() => Int)
  public userId: number;

  @Field(() => [Int])
  public proposalPks: number[];
}

@Resolver()
export class UpdateTechnicalReviewAssigneeMutation {
  @Mutation(() => TechnicalReviewsResponseWrap)
  async updateTechnicalReviewAssignee(
    @Args() args: UpdateTechnicalReviewAssigneeInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.updateTechnicalReviewAssignee(
        context.user,
        args
      ),
      TechnicalReviewsResponseWrap
    );
  }
}
