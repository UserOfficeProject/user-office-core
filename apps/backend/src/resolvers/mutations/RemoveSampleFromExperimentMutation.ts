import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentHasSample } from '../types/ExperimentHasSample';

@ArgsType()
export class RemoveSampleFromExperimentInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  experimentPk: number;
}

@Resolver()
export class RemoveSampleFromExperimentMutation {
  @Mutation(() => ExperimentHasSample)
  removeSampleFromExperiment(
    @Args() input: RemoveSampleFromExperimentInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.removeSampleFromExperiment(
      context.user,
      input
    );
  }
}
