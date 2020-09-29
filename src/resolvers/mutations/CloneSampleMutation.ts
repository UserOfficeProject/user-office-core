import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CloneSampleMutation {
  @Mutation(() => SampleResponseWrap)
  cloneSample(
    @Arg('sampleId', () => Int) sampleId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.cloneSample(context.user, sampleId),
      SampleResponseWrap
    );
  }
}
