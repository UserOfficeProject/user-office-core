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
export class CloneExperimentSampleInput {
  @Field(() => Int)
  experimentPk: number;

  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  newSampleTitle?: string;
}

@Resolver()
export class CloneExperimentSampleMutation {
  @Mutation(() => ExperimentHasSample)
  cloneExperimentSample(
    @Args() args: CloneExperimentSampleInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.cloneExperimentSample(
      context.user,
      args
    );
  }
}
