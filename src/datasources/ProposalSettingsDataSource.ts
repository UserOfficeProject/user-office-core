/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../models/ProposalStatus';
import { CreateProposalStatusArgs } from '../resolvers/mutations/CreateProposalStatusMutation';

export interface ProposalSettingsDataSource {
  createProposalStatus(args: CreateProposalStatusArgs): Promise<ProposalStatus>;
  getProposalStatus(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAllProposalStatuses(): Promise<ProposalStatus[]>;
  updateProposalStatus(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  deleteProposalStatus(proposalStatusId: number): Promise<ProposalStatus>;
}
