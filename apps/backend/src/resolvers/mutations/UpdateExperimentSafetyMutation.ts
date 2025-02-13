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
import { ExperimentSafety } from '../types/Experiment';

@ArgsType()
export class UpdateExperimentSafetyArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateExperimentSafetyMutation {
  @Mutation(() => ExperimentSafety)
  updateExperimentSafety(
    @Args() args: UpdateExperimentSafetyArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.updateExperimentSafety(
      context.user,
      args
    );
  }
}
