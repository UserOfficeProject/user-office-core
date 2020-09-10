import {
  Args,
  Ctx,
  Mutation,
  Resolver,
  ArgsType,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleStatus } from '../../models/Sample';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateSampleSafetyReviewArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => SampleStatus)
  public safetyStatus: SampleStatus;

  @Field()
  public safetyComment: string;
}

@Resolver()
export class UpdateSampleSafetyReview {
  @Mutation(() => SampleResponseWrap)
  updateSampleSafetyReview(
    @Args() args: UpdateSampleSafetyReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.updateSampleSafetyReview(context.user, args),
      SampleResponseWrap
    );
  }
}
