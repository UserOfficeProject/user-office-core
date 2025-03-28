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
export class ReviewExperimentSafetyArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class ReviewExperimentSafetyMutation {
  @Mutation(() => ExperimentSafety)
  reviewExperimentSafety(
    @Args() args: ReviewExperimentSafetyArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.reviewExperimentSafety(
      context.user,
      args
    );
  }
}
