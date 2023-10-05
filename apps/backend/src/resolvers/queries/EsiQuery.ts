import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyInput } from './../types/ExperimentSafetyInput';

@Resolver()
export class EsiQuery {
  @Query(() => ExperimentSafetyInput, { nullable: true })
  esi(@Ctx() context: ResolverContext, @Arg('esiId', () => Int) esiId: number) {
    return context.queries.proposalEsi.getEsi(context.user, esiId);
  }
}
