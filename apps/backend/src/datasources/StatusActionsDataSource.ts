import {
  ConnectionHasStatusAction,
  StatusAction,
} from '../models/ProposalStatusAction';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';

export interface StatusActionsDataSource {
  getConnectionStatusActions(
    proposalWorkflowConnectionId: number,
    proposalWorkflowId: number,
    entityType: ConnectionHasStatusAction['entityType']
  ): Promise<ConnectionHasStatusAction[]>;
  getConnectionStatusAction(
    proposalWorkflowConnectionId: number,
    proposalStatusActionId: number,
    entityType: ConnectionHasStatusAction['entityType']
  ): Promise<ConnectionHasStatusAction>;
  updateConnectionStatusAction(
    data: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction>;
  getStatusAction(actionId: number): Promise<StatusAction>;
  getStatusActions(): Promise<StatusAction[]>;
  addConnectionStatusActions(
    connectionStatusActionsInput: AddConnectionStatusActionsInput,
    entityType: ConnectionHasStatusAction['entityType']
  ): Promise<ConnectionHasStatusAction[] | null>;
}
