import { ProposalStatus } from '../../models/ProposalStatus';
import { CreateProposalStatusArgs } from '../../resolvers/mutations/CreateProposalStatusMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatus = new ProposalStatus(
  1,
  'DRAFT',
  'When proposal is created it gets draft status before it is submitted.'
);

export class ProposalSettingsDataSourceMock
  implements ProposalSettingsDataSource {
  async createProposalStatus(
    args: CreateProposalStatusArgs
  ): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }

  async getProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus | null> {
    return dummyProposalStatus;
  }

  async getAllProposalStatuses(): Promise<ProposalStatus[]> {
    return [dummyProposalStatus];
  }

  async updateProposalStatus(
    proposalStatus: ProposalStatus
  ): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    return dummyProposalStatus;
  }
}
