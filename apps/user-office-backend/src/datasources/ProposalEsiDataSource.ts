import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { Rejection } from '../models/Rejection';
import { UpdateEsiArgs } from '../resolvers/mutations/UpdateEsiMutation';
import { GetProposalEsisFilter } from '../resolvers/queries/EsisQuery';

export interface ProposalEsiDataSource {
  // Create
  createEsi(
    scheduledEventId: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafetyInput | Rejection>;

  // Read
  getEsi(esiId: number): Promise<ExperimentSafetyInput | null>;
  getEsis(filter?: GetProposalEsisFilter): Promise<ExperimentSafetyInput[]>;

  // Update
  updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput>;
}
