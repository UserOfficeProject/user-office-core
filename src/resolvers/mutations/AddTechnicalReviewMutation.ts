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
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { TechnicalReviewResponseWrap } from '../types/CommonWrappers';
import { TechnicalReview } from '../types/TechnicalReview';
import { wrapResponse } from '../wrapResponse';
@ArgsType()
export class AddTechnicalReviewArgs {
  @Field(() => Int)
  public proposalID: number;

  @Field(() => String, { nullable: true })
  public comment: string;

  @Field(() => String, { nullable: true })
  public publicComment: string;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus;
}

@Resolver()
export class AddTechnicalReviewMutation {
  @Mutation(() => TechnicalReviewResponseWrap)
  addTechnicalReview(
    @Args() args: AddTechnicalReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse<TechnicalReview>(
      context.mutations.review.setTechnicalReview(context.user, args),
      TechnicalReviewResponseWrap
    );
  }
}
