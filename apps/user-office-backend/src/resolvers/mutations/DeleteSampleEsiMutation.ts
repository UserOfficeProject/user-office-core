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
export class DeleteSampleEsiInput {
  @Field(() => Int)
  sampleId: number;

  @Field(() => Int)
  esiId: number;
}

@Resolver()
export class DeleteSampleEsiMutation {
  @Mutation(() => SampleExperimentSafetyInput)
  deleteSampleEsi(
    @Args() input: DeleteSampleEsiInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sampleEsi.deleteSampleEsi(context.user, input);
  }
}
