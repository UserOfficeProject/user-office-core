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
export class UpdateExperimentSampleInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  experimentPk: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateExperimentSampleMutation {
  @Mutation(() => ExperimentHasSample)
  updateExperimentSample(
    @Args() input: UpdateExperimentSampleInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.addSampleToExperiment(
      context.user,
      input
    );
  }
}
