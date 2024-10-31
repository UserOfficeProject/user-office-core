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
import { SampleStatus } from '../../models/Sample';
import { Sample } from '../types/Sample';

@ArgsType()
export class SubmitSampleReviewArg {
  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  safetyComment?: string;

  @Field(() => SampleStatus)
  safetyStatus: SampleStatus;
}

@Resolver()
export class SubmitSampleMutation {
  @Mutation(() => Sample)
  async submitSampleReview(
    @Args() args: SubmitSampleReviewArg,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.submitSampleReview(context.user, args);
  }
}
