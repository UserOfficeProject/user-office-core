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
import { ExperimentSafetyReviewerDecisionEnum } from '../../models/Experiment';
import { ExperimentSafety } from '../types/ExperimentSafety';

@ArgsType()
export class SubmitExperimentSafetyReviewerExperimentSafetyReviewArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => ExperimentSafetyReviewerDecisionEnum, { nullable: true })
  decision: ExperimentSafetyReviewerDecisionEnum | null;

  @Field(() => String, { nullable: true })
  comment: string | null;
}

@Resolver()
export class SubmitExperimentSafetyReviewerExperimentSafetyReviewMutation {
  @Mutation(() => ExperimentSafety)
  submitExperimentSafetyReviewerExperimentSafetyReview(
    @Args() args: SubmitExperimentSafetyReviewerExperimentSafetyReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.submitExperimentSafetyReviewerExperimentSafetyReview(
      context.user,
      args
    );
  }
}
