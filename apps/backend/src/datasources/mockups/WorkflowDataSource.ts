import { Status } from '../../models/ProposalStatus';
import { Workflow } from '../../models/ProposalWorkflow';
import { StatusChangingEvent } from '../../models/StatusChangingEvent';
import {
  NextAndPreviousStatuses,
  WorkflowConnectionWithStatus,
} from '../../models/WorkflowConnections';
import { AddWorkflowStatusInput } from '../../resolvers/mutations/settings/AddWorkflowStatusMutation';
import { CreateWorkflowInput } from '../../resolvers/mutations/settings/CreateWorkflowMutation';
import { WorkflowDataSource } from '../WorkflowDataSource';

export const dummyStatuses = [
  new Status(1, 'DRAFT', 'Draft', '', true, 'proposal'),
  new Status(
    2,
    'FEASIBILITY_REVIEW',
    'Feasibility review',
    '',
    true,
    'proposal'
  ),
];
export const dummyWorkflow = new Workflow(
  1,
  'Test workflow',
  'This is description',
  'proposal'
);

export const dummyWorkflowConnection = new WorkflowConnectionWithStatus(
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
    entityType: 'proposal',
  },
  null,
  null,
  'proposalWorkflowConnections_0',
  null
);

export const anotherDummyWorkflowConnection = new WorkflowConnectionWithStatus(
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
    entityType: 'proposal',
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

export class WorkflowDataSourceMock implements WorkflowDataSource {
  async createWorkflow(args: CreateWorkflowInput): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflow(proposalWorkflowId: number): Promise<Workflow | null> {
    return dummyWorkflow;
  }

  async getWorkflowByCall(callId: number): Promise<Workflow | null> {
    return dummyWorkflow;
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return [dummyWorkflow];
  }

  async updateWorkflow(proposalWorkflow: Workflow): Promise<Workflow> {
    return dummyWorkflow;
  }

  async deleteWorkflow(proposalWorkflowId: number): Promise<Workflow> {
    return dummyWorkflow;
  }

  async getWorkflowConnections(
    proposalWorkflowId: number
  ): Promise<WorkflowConnectionWithStatus[]> {
    return [dummyWorkflowConnection, anotherDummyWorkflowConnection];
  }

  async getWorkflowConnectionsById(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number,
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousStatuses
  ): Promise<WorkflowConnectionWithStatus[]> {
    return [dummyWorkflowConnection];
  }

  async addWorkflowStatus(
    newWorkflowStatusInput: AddWorkflowStatusInput
  ): Promise<WorkflowConnectionWithStatus> {
    return dummyWorkflowConnection;
  }

  async updateWorkflowStatuses(
    proposalWorkflowStatuses: WorkflowConnectionWithStatus[]
  ): Promise<WorkflowConnectionWithStatus[]> {
    return [dummyWorkflowConnection];
  }

  async deleteWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number,
    sortOrder: number
  ): Promise<WorkflowConnectionWithStatus> {
    return dummyWorkflowConnection;
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
}
