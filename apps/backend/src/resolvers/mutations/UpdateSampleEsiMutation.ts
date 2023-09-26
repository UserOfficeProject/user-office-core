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
export class UpdateSampleEsiArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => Int)
  sampleId: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateSampleEsiMutation {
  @Mutation(() => SampleExperimentSafetyInput)
  updateSampleEsi(
    @Args() args: UpdateSampleEsiArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sampleEsi.updateSampleEsi(context.user, args);
  }
}
