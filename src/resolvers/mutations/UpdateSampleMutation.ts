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
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateSampleArgs {
  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  safetyComment?: string;

  @Field(() => SampleStatus, { nullable: true })
  safetyStatus?: SampleStatus;

  // do not expose this fields to a user
  proposalPk?: number;
  questionaryId?: number;
  shipmentId?: number | null;
  isPostProposalSubmission?: boolean | null;
}

@Resolver()
export class UpdateSampleMutation {
  @Mutation(() => SampleResponseWrap)
  updateSample(
    @Args() args: UpdateSampleArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.updateSample(context.user, args),
      SampleResponseWrap
    );
  }
}
