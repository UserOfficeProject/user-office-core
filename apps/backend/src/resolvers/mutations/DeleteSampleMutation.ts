import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';

@Resolver()
export class DeleteSampleMutation {
  @Mutation(() => Sample)
  deleteSample(
    @Arg('sampleId', () => Int) sampleId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sample.deleteSample(context.user, sampleId);
  }
}
