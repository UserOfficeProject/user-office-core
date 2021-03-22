import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { AddProposalWorkflowStatusInput } from '../../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatus = new ProposalStatus(
  1,
  'DRAFT',
  'Draft',
  'When proposal is created it gets draft status before it is submitted.',
  true
);

export const anotherDummyProposalStatus = new ProposalStatus(
  11,
  'NEW_PROPOSAL_STATUS',
  'New proposal status',
  'Proposal status for testing.',
  false
);

export const dummyProposalWorkflow = new ProposalWorkflow(
  1,
  'Test workflow',
  'This is description'
);

export const dummyProposalWorkflowConnection = new ProposalWorkflowConnection(
  1,
  1,
  1,
  1,
  {
    id: 1,
    shortCode: 'TEST_STATUS',
    name: 'Test status',
    description: 'Test status',
    isDefault: false,
  },
  null,
  null,
  'proposalWorkflowConnections_0',
  null
);

export const anotherDummyProposalWorkflowConnection = new ProposalWorkflowConnection(
  2,
  2,
  1,
  2,
  {
    id: 2,
    shortCode: 'TEST_STATUS_2',
    name: 'Test status 2',
    description: 'Test status 2',
    isDefault: false,
  },
  null,
  1,
  'proposalWorkflowConnections_0',
  null
);

export const dummyStatusChangingEvent = new StatusChangingEvent(
  1,
  1,
  'PROPOSAL_SUBMITTED'
);

export class ProposalSettingsDataSourceMock
  implements ProposalSettingsDataSource {
  async createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
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
    return proposalStatus;
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    return anotherDummyProposalStatus;
  }

  async createProposalWorkflow(
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null> {
    return dummyProposalWorkflow;
  }

  async getProposalWorkflowByCall(
    callId: number
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

  async getProposalWorkflowConnections(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflowConnection[]> {
    return [
      dummyProposalWorkflowConnection,
      anotherDummyProposalWorkflowConnection,
    ];
  }

  async getProposalWorkflowConnectionsById(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number
  ): Promise<ProposalWorkflowConnection[]> {
    return [dummyProposalWorkflowConnection];
  }

  async addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection> {
    return dummyProposalWorkflowConnection;
  }

  async updateProposalWorkflowStatuses(
    proposalWorkflowStatuses: ProposalWorkflowConnection[]
  ): Promise<ProposalWorkflowConnection[]> {
    return [dummyProposalWorkflowConnection];
  }

  async deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number
  ): Promise<ProposalWorkflowConnection> {
    return dummyProposalWorkflowConnection;
  }

  async addStatusChangingEventsToConnection(
    proposalWorkflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }

  async getStatusChangingEventsByConnectionId(
    proposalWorkflowConnectionId: number
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }

  async getProposalNextStatus(
    proposalId: number,
    event: Event
  ): Promise<ProposalStatus | null> {
    return new ProposalStatus(
      5,
      'SEP_REVIEW',
      'SEP Review',
      'Sep review status description',
      true
    );
  }
}
