import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Experiment } from '../types/Experiment';

@Resolver()
export class ExperimentQuery {
  @Query(() => Experiment)
  async experiment(
    @Arg('experimentPk', () => Int) experimentPk: number,
    @Ctx() context: ResolverContext
  ): Promise<Experiment | null> {
    return context.queries.experiment.getExperiment(context.user, experimentPk);
  }
}
