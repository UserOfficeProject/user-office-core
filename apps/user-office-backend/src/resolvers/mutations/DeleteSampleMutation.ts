import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteSampleMutation {
  @Mutation(() => SampleResponseWrap)
  deleteSample(
    @Arg('sampleId', () => Int) sampleId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.deleteSample(context.user, sampleId),
      SampleResponseWrap
    );
  }
}
