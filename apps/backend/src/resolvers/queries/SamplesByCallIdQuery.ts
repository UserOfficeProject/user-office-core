import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';

@Resolver()
export class SamplesByCallIdQuery {
  @Query(() => [Sample], { nullable: true })
  samplesByCallId(
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int) callId: number
  ) {
    return context.queries.sample.getSamplesByCallId(context.user, callId);
  }
}
