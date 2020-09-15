/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../models/ProposalStatus';
import { CreateProposalStatusArgs } from '../resolvers/mutations/CreateProposalStatusMutation';

export interface ProposalStatusDataSource {
  create(args: CreateProposalStatusArgs): Promise<ProposalStatus>;
  get(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAll(): Promise<ProposalStatus[]>;
  update(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  delete(proposalStatusId: number): Promise<ProposalStatus>;
}
