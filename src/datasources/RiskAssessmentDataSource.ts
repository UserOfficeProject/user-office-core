import { Rejection } from '../models/Rejection';
import { RiskAssessment } from '../models/RiskAssessment';
import { Sample } from '../models/Sample';
import { RiskAssessmentsFilter } from '../queries/RiskAssessmentQueries';
import { CreateRiskAssessmentArgs } from '../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../resolvers/mutations/UpdateRiskAssessmentMutation';

export interface RiskAssessmentDataSource {
  // Create
  createRiskAssessment(
    args: CreateRiskAssessmentArgs,
    creatorId: number
  ): Promise<RiskAssessment>;

  // Read
  getRiskAssessment(riskAssessmentId: number): Promise<RiskAssessment | null>;
  getRiskAssessments(filter: RiskAssessmentsFilter): Promise<RiskAssessment[]>;
  getRiskAssessmentSamples(riskAssessmentId: number): Promise<Sample[]>;

  // Update
  updateRiskAssessment(
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection>;

  // Delete
  deleteRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | Rejection>;
}
