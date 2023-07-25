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
import { SampleExperimentSafetyInput } from '../types/SampleExperimentSafetyInput';

@ArgsType()
export class CreateSampleEsiInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  esiId: number;
}

@Resolver()
export class CreateSampleEsiMutation {
  @Mutation(() => SampleExperimentSafetyInput)
  createSampleEsi(
    @Args() input: CreateSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sampleEsi.createSampleEsi(context.user, input);
  }
}
