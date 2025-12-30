import {
  ConnectionHasStatusAction,
  StatusAction,
} from '../models/StatusAction';
import { SetStatusActionsOnConnectionInput } from '../resolvers/mutations/settings/SetStatusActionsOnConnectionMutation';

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
  setStatusActionsOnConnection(
    input: SetStatusActionsOnConnectionInput
  ): Promise<ConnectionHasStatusAction[] | null>;
}
