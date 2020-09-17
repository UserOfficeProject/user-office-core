import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import { CreateProposalStatusArgs } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowArgs } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatus = new ProposalStatus(
  1,
  'DRAFT',
  'When proposal is created it gets draft status before it is submitted.'
);

export const dummyProposalWorkflow = new ProposalWorkflow(
  1,
  'Test workflow',
  'This is description'
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

  async createProposalWorkflow(
    args: CreateProposalWorkflowArgs
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null> {
    return dummyProposalWorkflow;
  }

  async getAllProposalWorkflows(): Promise<ProposalWorkflow[]> {
    return [dummyProposalWorkflow];
  }

  async updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async deleteProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }
}
