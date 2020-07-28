import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  ArgsType,
  Int,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleStatus } from '../../models/Sample';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateSampleStatusArgs {
  @Field(() => Int)
  sampleId: number;

  @Field(() => SampleStatus)
  status: SampleStatus;
}

@Resolver()
export class UpdateSampleStatusMutation {
  @Mutation(() => SampleResponseWrap)
  updateSampleStatus(
    @Args() args: UpdateSampleStatusArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.updateSampleStatus(context.user, args),
      SampleResponseWrap
    );
  }
}
