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
export class AddSampleToExperimentInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  experimentPk: number;
}

@Resolver()
export class AddSampleToExperimentMutation {
  @Mutation(() => ExperimentHasSample)
  addSampleToExperiment(
    @Args() input: AddSampleToExperimentInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.addSampleToExperiment(
      context.user,
      input
    );
  }
}
