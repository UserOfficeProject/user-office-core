import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafety } from '../types/ExperimentSafety';

@Resolver()
export class CreateExperimentSafetyMutation {
  @Mutation(() => ExperimentSafety)
  createExperimentSafety(
    @Arg('experimentPk', () => Int) experimentPk: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.createOrGetExperimentSafety(
      context.user,
      experimentPk
    );
  }
}
