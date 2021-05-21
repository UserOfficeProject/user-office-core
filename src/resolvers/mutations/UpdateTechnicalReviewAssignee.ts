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
import { ProposalsResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateTechnicalReviewAssigneeInput {
  @Field(() => Int!)
  public userId: number;

  @Field(() => [Int!]!)
  public proposalIds: number[];
}

@Resolver()
export class UpdateTechnicalReviewAssigneeMutation {
  @Mutation(() => ProposalsResponseWrap)
  async updateTechnicalReviewAssignee(
    @Args() args: UpdateTechnicalReviewAssigneeInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.updateTechnicalReviewAssignee(
        context.user,
        args
      ),
      ProposalsResponseWrap
    );
  }
}
