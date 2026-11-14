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
import { Experiment } from '../types/Experiment';

@ArgsType()
export class UpdateExperimentInput {
  @Field(() => Int)
  experimentPk: number;

  @Field(() => String)
  notes: string;
}

@Resolver()
export class UpdateExperimentMutation {
  @Mutation(() => Experiment)
  updateExperiment(
    @Args() input: UpdateExperimentInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.updateExperiment(context.user, input);
  }
}
