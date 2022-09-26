import { ExperimentSafetyDocument } from '../models/ExperimentSafetyDocument';
import { Rejection } from '../models/Rejection';
import { CreateEsdArgs } from '../resolvers/mutations/CreateEsdMutation';
import { UpdateEsdArgs } from '../resolvers/mutations/UpdateEsdMutation';

export interface ProposalEsdDataSource {
  // Create
  createEsd(
    args: CreateEsdArgs & { reviewerUserId: number }
  ): Promise<ExperimentSafetyDocument | Rejection>;

  // Read
  getEsd(esdId: number): Promise<ExperimentSafetyDocument | null>;

  // Update
  updateEsd(
    args: UpdateEsdArgs & { reviewerUserId: number }
  ): Promise<ExperimentSafetyDocument | Rejection>;
}
