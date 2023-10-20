import { GraphQLError } from 'graphql';

import {
  ConnectionHasStatusAction,
  ProposalStatusAction,
  ProposalStatusActionType,
} from '../../models/ProposalStatusAction';
import { AddConnectionStatusActionsInput } from '../../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { StatusActionsDataSource } from '../StatusActionsDataSource';

export const dummyConnectionHasStatusAction = new ConnectionHasStatusAction(
  1,
  1,
  1,
  'Dummy action',
  ProposalStatusActionType.EMAIL,
  false,
  {}
);

export const dummyStatusAction = new ProposalStatusAction(
  1,
  'Dummy action',
  'Dummy action description',
  ProposalStatusActionType.EMAIL
);

export const anotherDummyStatusAction = new ProposalStatusAction(
  2,
  'Dummy action 2',
  'Dummy action 2 description',
  ProposalStatusActionType.RABBITMQ
);

export const dummyStatusActions = [dummyStatusAction, anotherDummyStatusAction];

export class StatusActionsDataSourceMock implements StatusActionsDataSource {
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

  async getStatusAction(actionId: number): Promise<ProposalStatusAction> {
    const foundStatusAction = dummyStatusActions.find(
      (statusAction) => statusAction.id === actionId
    );

    if (!foundStatusAction) {
      throw new GraphQLError(`Status action with ${actionId} not found`);
    }

    return foundStatusAction;
  }

  async getStatusActions(): Promise<ProposalStatusAction[]> {
    return dummyStatusActions;
  }

  async addConnectionStatusActions(
    input: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[]> {
    return [dummyConnectionHasStatusAction];
  }
}
