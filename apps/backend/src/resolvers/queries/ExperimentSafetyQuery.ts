import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafety } from '../types/Experiment';

@Resolver()
export class ExperimentSafetyQuery {
  @Query(() => ExperimentSafety, { nullable: true })
  experimentSafety(
    @Ctx() context: ResolverContext,
    @Arg('experimentSafetyPk', () => Int) experimentSafetyPk: number
  ) {
    return context.queries.experiment.getExperimentSafetyByExperimentPk(
      context.user,
      experimentSafetyPk
    );
  }
}
