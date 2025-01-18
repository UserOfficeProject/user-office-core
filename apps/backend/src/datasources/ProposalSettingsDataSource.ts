import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow, Workflow } from '../models/ProposalWorkflow';
import {
  NextAndPreviousProposalStatuses,
  ProposalWorkflowConnection,
  WorkflowConnection,
} from '../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { AddProposalWorkflowStatusInput } from '../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';

export interface ProposalSettingsDataSource {
  createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus>;
  getProposalStatus(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAllProposalStatuses(): Promise<ProposalStatus[]>;
  updateProposalStatus(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  deleteProposalStatus(proposalStatusId: number): Promise<ProposalStatus>;
  createProposalWorkflow(
    newProposalWorkflowInput: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow>;
  getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null>;
  getProposalWorkflowByCall(callId: number): Promise<ProposalWorkflow | null>; //TODO: This is not moved to WorkflowDataSource. This needs to be planned later
  getAllWorkflows(entityType: 'proposal' | 'experiment'): Promise<Workflow[]>;
  updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow>;
  deleteProposalWorkflow(proposalWorkflowId: number): Promise<ProposalWorkflow>;
  getProposalWorkflowConnections(
    proposalWorkflowId: number,
    droppableGroupId?: string | undefined,
    byParentGroupId?: boolean | undefined
  ): Promise<ProposalWorkflowConnection[]>;
  getWorkflowConnections(
    workflowId: number,
    entityType: 'proposal' | 'experiment',
    droppableGroupId?: string | undefined,
    byParentGroupId?: boolean | undefined
  ): Promise<WorkflowConnection[]>;
  getProposalWorkflowConnectionsById(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number,
    { nextStatusId, prevStatusId, sortOrder }: NextAndPreviousProposalStatuses
  ): Promise<ProposalWorkflowConnection[]>;
  addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection>;
  updateProposalWorkflowStatuses(
    proposalWorkflowStatuses: ProposalWorkflowConnection[]
  ): Promise<ProposalWorkflowConnection[]>;
  deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number,
    sortOrder: number
  ): Promise<ProposalWorkflowConnection>;
  addStatusChangingEventsToConnection(
    proposalWorkflowConnectionId: number,
    statusChangingEvents: string[]
  ): Promise<StatusChangingEvent[]>;
  getStatusChangingEventsByConnectionIds(
    proposalWorkflowConnectionIds: number[]
  ): Promise<StatusChangingEvent[]>;
}
