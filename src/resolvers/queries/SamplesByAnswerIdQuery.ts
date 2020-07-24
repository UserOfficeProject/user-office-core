import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Sample } from '../types/Sample';

@Resolver()
export class SamplesByAnswerIdQuery {
  @Query(() => [Sample], { nullable: true })
  samplesByAnswerId(
    @Ctx() context: ResolverContext,
    @Arg('answerId', () => Int) answerId: number
  ) {
    return context.queries.sample.getSamplesByAnswerId(context.user, answerId);
  }
}
