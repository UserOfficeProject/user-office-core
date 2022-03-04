import { Event } from '../../events/event.enum';
import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import {
  NextAndPreviousProposalStatuses,
  ProposalWorkflowConnection,
} from '../../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import { AddProposalWorkflowStatusInput } from '../../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatuses = [
  new ProposalStatus(1, 'DRAFT', 'Draft', '', true),
  new ProposalStatus(2, 'FEASIBILITY_REVIEW', 'Feasibility review', '', true),
];
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

export const anotherDummyProposalWorkflowConnection =
  new ProposalWorkflowConnection(
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
  implements ProposalSettingsDataSource
{
  async createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus> {
    return { ...newProposalStatusInput, id: 1, isDefault: false };
  }

  async getProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus | null> {
    return dummyProposalStatuses.find(
      (s) => s.id === proposalStatusId
    ) as ProposalStatus;
  }

  async getAllProposalStatuses(): Promise<ProposalStatus[]> {
    return dummyProposalStatuses;
  }

  async updateProposalStatus(
    proposalStatus: ProposalStatus
  ): Promise<ProposalStatus> {
    return proposalStatus;
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    return dummyProposalStatuses.splice(
      dummyProposalStatuses.findIndex((s) => s.id === proposalStatusId),
      1
    )[0];
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
    proposalWorkflowConnectionId: number,
    {
      nextProposalStatusId,
      prevProposalStatusId,
      sortOrder,
    }: NextAndPreviousProposalStatuses
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
    proposalWorkflowId: number,
    sortOrder: number
  ): Promise<ProposalWorkflowConnection> {
    return dummyProposalWorkflowConnection;
  }

  async addStatusChangingEventsToConnection(
    proposalWorkflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }

  async getStatusChangingEventsByConnectionIds(
    proposalWorkflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]> {
    return [dummyStatusChangingEvent];
  }

  async getProposalNextStatus(
    proposalPk: number,
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
