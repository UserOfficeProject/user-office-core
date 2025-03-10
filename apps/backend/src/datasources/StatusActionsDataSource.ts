import {
  ConnectionHasStatusAction,
  StatusAction,
} from '../models/StatusAction';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';

export interface StatusActionsDataSource {
  getConnectionStatusActions(
    workflowConnectionId: number,
    workflowId: number
  ): Promise<ConnectionHasStatusAction[]>;
  getConnectionStatusAction(
    workflowConnectionId: number,
    statusActionId: number
  ): Promise<ConnectionHasStatusAction>;
  updateConnectionStatusAction(
    data: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction>;
  getStatusAction(actionId: number): Promise<StatusAction>;
  getStatusActions(): Promise<StatusAction[]>;
  addConnectionStatusActions(
    connectionStatusActionsInput: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null>;
}
