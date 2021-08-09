import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { RiskAssessmentResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteRiskAssessment {
  @Mutation(() => RiskAssessmentResponseWrap)
  deleteRiskAssessment(
    @Arg('riskAssessmentId', () => Int) riskAssessmentId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.riskAssessment.deleteRiskAssessment(
        context.user,
        riskAssessmentId
      ),
      RiskAssessmentResponseWrap
    );
  }
}
