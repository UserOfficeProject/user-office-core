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
import { ExperimentSafety } from '../types/ExperimentSafety';

@ArgsType()
export class SubmitExperimentSafetyArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateExperimentSafetyMutation {
  @Mutation(() => ExperimentSafety)
  submitExperimentSafety(
    @Args() args: SubmitExperimentSafetyArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.submitExperimentSafety(
      context.user,
      args
    );
  }
}
