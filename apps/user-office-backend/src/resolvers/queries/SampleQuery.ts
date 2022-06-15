import { Arg, Ctx, Query, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';

@Resolver()
export class SampleQuery {
  @Query(() => Sample, { nullable: true })
  sample(
    @Ctx() context: ResolverContext,
    @Arg('sampleId', () => Int) sampleId: number
  ) {
    return context.queries.sample.getSample(context.user, sampleId);
  }
}
