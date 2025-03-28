import {
  Ctx,
  Mutation,
  Resolver,
  Int,
  ArgsType,
  Field,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafety } from '../types/ExperimentSafety';

@ArgsType()
export class StartExperimentSafetyReviewArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class StartExperimentSafetyReviewMutation {
  @Mutation(() => ExperimentSafety)
  startExperimentSafetyReview(
    @Args() args: StartExperimentSafetyReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.startExperimentSafetyReview(
      context.user,
      args
    );
  }
}
