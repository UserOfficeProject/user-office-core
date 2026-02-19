import { GraphQLError } from 'graphql';

import {
  ConnectionHasStatusAction,
  StatusAction,
  StatusActionType,
} from '../../models/StatusAction';
import { SetStatusActionsOnConnectionInput } from '../../resolvers/mutations/settings/SetStatusActionsOnConnectionMutation';
import { StatusActionsDataSource } from '../StatusActionsDataSource';

export const dummyConnectionHasStatusAction = new ConnectionHasStatusAction(
  1,
  1,
  1,
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
    workflowConnectionId: number,
    statusActionId: number
  ): Promise<ConnectionHasStatusAction> {
    return dummyConnectionHasStatusAction;
  }
  async getConnectionStatusActions(
    workflowConnectionId: number
  ): Promise<ConnectionHasStatusAction[]> {
    return [dummyConnectionHasStatusAction];
  }

  async updateConnectionStatusAction(
    statusAction: ConnectionHasStatusAction
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

  async setStatusActionsOnConnection(
    connectionStatusActionsInput: SetStatusActionsOnConnectionInput
  ): Promise<ConnectionHasStatusAction[]> {
    return [dummyConnectionHasStatusAction];
  }
}
