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
import { RiskAssessmentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateRiskAssessmentArgs {
  @Field(() => Int)
  proposalPk: number;

  @Field(() => Int)
  scheduledEventId: number;
}

@Resolver()
export class CreateRiskAssessmentMutation {
  @Mutation(() => RiskAssessmentResponseWrap)
  createRiskAssessment(
    @Args() args: CreateRiskAssessmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.riskAssessment.createRiskAssessment(context.user, args),
      RiskAssessmentResponseWrap
    );
  }
}
