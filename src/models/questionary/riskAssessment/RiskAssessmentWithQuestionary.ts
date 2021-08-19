import { GetRiskAssessmentQuery } from 'generated/sdk';

export type RiskAssessmentWithQuestionary = Exclude<
  GetRiskAssessmentQuery['riskAssessment'],
  null
>;
