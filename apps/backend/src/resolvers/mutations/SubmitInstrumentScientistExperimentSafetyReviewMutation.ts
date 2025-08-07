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
import { InstrumentScientistDecisionEnum } from '../../models/Experiment';
import { ExperimentSafety } from '../types/ExperimentSafety';

@ArgsType()
export class SubmitInstrumentScientistExperimentSafetyReviewArgs {
  @Field(() => Int)
  experimentSafetyPk: number;

  @Field(() => InstrumentScientistDecisionEnum, { nullable: true })
  decision: InstrumentScientistDecisionEnum | null;

  @Field(() => String, { nullable: true })
  comment: string | null;
}

@Resolver()
export class SubmitInstrumentScientistExperimentSafetyReviewMutation {
  @Mutation(() => ExperimentSafety)
  submitInstrumentScientistExperimentSafetyReview(
    @Args() args: SubmitInstrumentScientistExperimentSafetyReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experiment.submitInstrumentScientistExperimentSafetyReview(
      context.user,
      args
    );
  }
}
