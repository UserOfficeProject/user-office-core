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
import { RiskAssessmentStatus } from '../../models/RiskAssessment';
import { RiskAssessmentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateRiskAssessmentArgs {
  @Field(() => Int!)
  riskAssessmentId: number;

  @Field(() => RiskAssessmentStatus, { nullable: true })
  status?: RiskAssessmentStatus;

  questionaryId?: number;
}

@Resolver()
export class UpdateRiskAssessmentMutation {
  @Mutation(() => RiskAssessmentResponseWrap)
  updateRiskAssessment(
    @Args() args: UpdateRiskAssessmentArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.riskAssessment.updateRiskAssessment(context.user, args),
      RiskAssessmentResponseWrap
    );
  }
}
