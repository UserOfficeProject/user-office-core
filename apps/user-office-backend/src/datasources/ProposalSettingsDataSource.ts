import { ProposalStatus } from '../models/ProposalStatus';
import {
  ConnectionHasStatusAction,
  ProposalStatusAction,
} from '../models/ProposalStatusAction';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import {
  NextAndPreviousProposalStatuses,
  ProposalWorkflowConnection,
} from '../models/ProposalWorkflowConnections';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
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
  getProposalWorkflowByCall(callId: number): Promise<ProposalWorkflow | null>;
  getAllProposalWorkflows(): Promise<ProposalWorkflow[]>;
  updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow>;
  deleteProposalWorkflow(proposalWorkflowId: number): Promise<ProposalWorkflow>;
  getProposalWorkflowConnections(
    proposalWorkflowId: number,
    droppableGroupId?: string | undefined,
    byParentGroupId?: boolean | undefined
  ): Promise<ProposalWorkflowConnection[]>;
  getProposalWorkflowConnectionsById(
    proposalWorkflowId: number,
    proposalWorkflowConnectionId: number,
    {
      nextProposalStatusId,
      prevProposalStatusId,
      sortOrder,
    }: NextAndPreviousProposalStatuses
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

  getConnectionStatusActions(
    proposalWorkflowConnectionId: number,
    proposalWorkflowId: number
  ): Promise<ConnectionHasStatusAction[]>;
  updateConnectionStatusAction(
    data: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction>;
  getStatusActions(): Promise<ProposalStatusAction[]>;
  addConnectionStatusActions(
    input: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null>;
}
