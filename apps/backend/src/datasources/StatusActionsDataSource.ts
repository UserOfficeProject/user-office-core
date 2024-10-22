import {
  ConnectionHasStatusAction,
  ProposalStatusAction,
} from '../models/ProposalStatusAction';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';

export interface StatusActionsDataSource {
  getConnectionStatusActions(
    proposalWorkflowConnectionId: number,
    proposalWorkflowId: number
  ): Promise<ConnectionHasStatusAction[]>;
  getConnectionStatusAction(
    proposalWorkflowConnectionId: number,
    proposalStatusActionId: number
  ): Promise<ConnectionHasStatusAction>;
  updateConnectionStatusAction(
    data: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction>;
  getStatusAction(actionId: number): Promise<ProposalStatusAction>;
  getStatusActions(): Promise<ProposalStatusAction[]>;
  addConnectionStatusActions(
    connectionStatusActionsInput: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null>;
}
