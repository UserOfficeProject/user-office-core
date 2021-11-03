import { Args, ArgsType, Ctx, Field, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleExperimentSafetyInput } from './../types/SampleExperimentSafetyInput';

@ArgsType()
export class SampleEsiArgs {
  @Field(() => Int)
  public esiId: number;

  @Field(() => Int)
  public sampleId: number;
}

@Resolver()
export class SampleEsiQuery {
  @Query(() => SampleExperimentSafetyInput, { nullable: true })
  sampleEsi(@Ctx() context: ResolverContext, @Args() args: SampleEsiArgs) {
    return context.queries.sampleEsi.getSampleEsi(context.user, args);
  }
}
