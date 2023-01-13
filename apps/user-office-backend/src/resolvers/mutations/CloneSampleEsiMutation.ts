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
export class CloneSampleEsiInput {
  @Field(() => Int)
  esiId: number;

  @Field(() => Int)
  sampleId: number;

  @Field(() => String, { nullable: true })
  newSampleTitle?: string;
}

@Resolver()
export class CloneSampleEsiMutation {
  @Mutation(() => SampleExperimentSafetyInput)
  cloneSampleEsi(
    @Args() args: CloneSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sampleEsi.cloneSampleEsi(context.user, args);
  }
}
