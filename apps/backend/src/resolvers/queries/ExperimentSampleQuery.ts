import { Args, ArgsType, Ctx, Field, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentHasSample } from '../types/ExperimentHasSample';

@ArgsType()
export class ExperimentSampleArgs {
  @Field(() => Int)
  public experimentPk: number;

  @Field(() => Int)
  public sampleId: number;
}

@Resolver()
export class ExperimentSampleQuery {
  @Query(() => ExperimentHasSample, { nullable: true })
  experimentSample(
    @Ctx() context: ResolverContext,
    @Args() args: ExperimentSampleArgs
  ) {
    return context.queries.experiment.getExperimentSample(context.user, args);
  }
}
