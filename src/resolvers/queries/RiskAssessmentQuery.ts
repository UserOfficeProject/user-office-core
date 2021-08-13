import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { RiskAssessment } from '../types/RiskAssessment';

@Resolver()
export class RiskAssessmentQuery {
  @Query(() => RiskAssessment)
  riskAssessment(
    @Ctx() context: ResolverContext,
    @Arg('riskAssessmentId', () => Int)
    riskAssessmentId: number
  ) {
    return context.queries.riskAssessment.getRiskAssessment(
      context.user,
      riskAssessmentId
    );
  }
}
