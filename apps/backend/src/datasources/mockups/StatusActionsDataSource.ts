import { GraphQLError } from 'graphql';

import {
  ConnectionHasStatusAction,
  StatusAction,
  StatusActionType,
} from '../../models/ProposalStatusAction';
import { AddConnectionStatusActionsInput } from '../../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { StatusActionsDataSource } from '../StatusActionsDataSource';

export const dummyConnectionHasStatusAction = new ConnectionHasStatusAction(
  1,
  1,
  1,
  'Dummy action',
  StatusActionType.EMAIL,
  {}
);

export const dummyStatusAction = new StatusAction(
  1,
  'Dummy action',
  'Dummy action description',
  StatusActionType.EMAIL
);

export const anotherDummyStatusAction = new StatusAction(
  2,
  'Dummy action 2',
  'Dummy action 2 description',
  StatusActionType.RABBITMQ
);

export const dummyStatusActions = [dummyStatusAction, anotherDummyStatusAction];

export class StatusActionsDataSourceMock implements StatusActionsDataSource {
  async getConnectionStatusAction(
    proposalWorkflowConnectionId: number,
    proposalStatusActionId: number
  ): Promise<ConnectionHasStatusAction> {
    return dummyConnectionHasStatusAction;
  }
  async getConnectionStatusActions(
    proposalWorkflowConnectionId: number,
    proposalWorkflowId: number
  ): Promise<ConnectionHasStatusAction[]> {
    return [dummyConnectionHasStatusAction];
  }

  async updateConnectionStatusAction(
    proposalStatusAction: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction> {
    return dummyConnectionHasStatusAction;
  }

  async getStatusAction(actionId: number): Promise<StatusAction> {
    const foundStatusAction = dummyStatusActions.find(
      (statusAction) => statusAction.id === actionId
    );

    if (!foundStatusAction) {
      throw new GraphQLError(`Status action with ${actionId} not found`);
    }

    return foundStatusAction;
  }

  async getStatusActions(): Promise<StatusAction[]> {
    return dummyStatusActions;
  }

  async addConnectionStatusActions(
    connectionStatusActionsInput: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[]> {
    return [dummyConnectionHasStatusAction];
  }
}
