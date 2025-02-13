import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { GetProposalEsisFilter } from '../queries/ProposalEsiQueries';

export interface ProposalEsiDataSource {
  // Read
  getEsi(esiId: number): Promise<ExperimentSafetyInput | null>;
  getEsis(filter: GetProposalEsisFilter): Promise<ExperimentSafetyInput[]>;
}
