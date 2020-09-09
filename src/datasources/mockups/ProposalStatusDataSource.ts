import { ProposalStatus } from '../../models/ProposalStatus';
import { CreateProposalStatusArgs } from '../../resolvers/mutations/CreateProposalStatusMutation';
import { ProposalStatusDataSource } from '../ProposalStatusDataSource';

export const dummyProposalStatus = new ProposalStatus(
  1,
  'DRAFT',
  'When proposal is created it gets draft status before it is submitted.'
);

export class ProposalStatusDataSourceMock implements ProposalStatusDataSource {
  async create(args: CreateProposalStatusArgs): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }

  async get(proposalStatusId: number): Promise<ProposalStatus | null> {
    return dummyProposalStatus;
  }

  async getAll(): Promise<ProposalStatus[]> {
    return [dummyProposalStatus];
  }

  async update(proposalStatus: ProposalStatus): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }

  async delete(proposalStatusId: number): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }
}
