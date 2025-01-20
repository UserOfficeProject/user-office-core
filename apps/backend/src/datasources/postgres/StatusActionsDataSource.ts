import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import {
  ConnectionHasStatusAction,
  StatusAction,
  StatusActionType,
} from '../../models/ProposalStatusAction';
import { Rejection } from '../../models/Rejection';
import { AddConnectionStatusActionsInput } from '../../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import {
  EmailActionConfig,
  ProposalStatusActionConfig,
  RabbitMQActionConfig,
} from '../../resolvers/types/ProposalStatusActionConfig';
import { StatusActionsDataSource } from '../StatusActionsDataSource';
import database from './database';
import {
  StatusActionRecord,
  WorkflowConnectionHasActionsRecord,
} from './records';

export default class PostgresStatusActionsDataSource
  implements StatusActionsDataSource
{
  private createStatusActionConfig(
    type: StatusActionType,
    config: typeof ProposalStatusActionConfig
  ) {
    switch (type) {
      case StatusActionType.EMAIL: {
        const blankConfig = new EmailActionConfig();

        return Object.assign(blankConfig, config);
      }
      case StatusActionType.RABBITMQ: {
        const blankConfig = new RabbitMQActionConfig();

        return Object.assign(blankConfig, config);
      }
      default:
        return null;
    }
  }

  private createConnectionStatusActionObject(
    actionStatusRecord: WorkflowConnectionHasActionsRecord & {
      status_action_id: number;
      name: string;
      type: StatusActionType;
      config: typeof ProposalStatusActionConfig; // TODO: Proposal Needs to be removed
    }
  ) {
    return new ConnectionHasStatusAction(
      actionStatusRecord.connection_id,
      actionStatusRecord.status_action_id,
      actionStatusRecord.workflow_id,
      actionStatusRecord.name,
      actionStatusRecord.type,
      this.createStatusActionConfig(
        actionStatusRecord.type,
        actionStatusRecord.config
      ),
      actionStatusRecord.entity_type
    );
  }

  private createStatusActionObject(statusActionRecord: StatusActionRecord) {
    return new StatusAction(
      statusActionRecord.status_action_id,
      statusActionRecord.name,
      statusActionRecord.description,
      statusActionRecord.type
    );
  }

  async getConnectionStatusActions(
    workflowConnectionId: number,
    workflowId: number,
    entityType: ConnectionHasStatusAction['entityType']
  ): Promise<ConnectionHasStatusAction[]> {
    const statusActionRecords: (StatusActionRecord &
      WorkflowConnectionHasActionsRecord & {
        config: typeof ProposalStatusActionConfig;
      })[] = await database
      .select()
      .from('status_actions as sa')
      .join('workflow_connection_has_actions as wca', {
        'wca.action_id': 'sa.status_action_id',
      })
      .where('wca.workflow_id', workflowId)
      .andWhere('wca.connection_id', workflowConnectionId)
      .andWhere('wca.entity_type', entityType); //TODO: This needs to be retrieved from the Workflow connection or Workflow

    const statusActions = statusActionRecords.map((statusActionRecord) =>
      this.createConnectionStatusActionObject(statusActionRecord)
    );

    return statusActions;
  }

  async getConnectionStatusAction(
    workflowConnectionId: number,
    statusActionId: number,
    entityType: ConnectionHasStatusAction['entityType']
  ): Promise<ConnectionHasStatusAction> {
    const statusActionRecord: StatusActionRecord &
      WorkflowConnectionHasActionsRecord & {
        config: typeof ProposalStatusActionConfig;
      } = await database
      .select()
      .from('status_actions as sa')
      .join('workflow_connection_has_actions as wca', {
        'wca.action_id': 'sa.status_action_id',
      })
      .where('wca.action_id', statusActionId)
      .andWhere('wca.connection_id', workflowConnectionId)
      .andWhere('wca.entity_type', entityType)
      .first();

    if (!statusActionRecord) {
      throw new GraphQLError(
        `Status action not found ActionId: ${statusActionId} connectionId: ${workflowConnectionId}`
      );
    }

    return this.createConnectionStatusActionObject(statusActionRecord);
  }

  async updateConnectionStatusAction(
    statusAction: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction> {
    const [updatedStatusAction]: (WorkflowConnectionHasActionsRecord & {
      config: typeof ProposalStatusActionConfig;
    })[] = await database
      .update(
        {
          config: statusAction.config,
        },
        ['*']
      )
      .from('workflow_connection_has_actions')
      .where('connection_id', statusAction.connectionId)
      .andWhere('action_id', statusAction.actionId);

    if (!updatedStatusAction) {
      throw new GraphQLError(`StatusAction not found ${statusAction.actionId}`);
    }

    return this.createConnectionStatusActionObject({
      status_action_id: statusAction.actionId,
      name: statusAction.name,
      type: statusAction.type,
      ...updatedStatusAction,
    });
  }

  async getStatusAction(actionId: number): Promise<StatusAction> {
    const statusAction = await database
      .select<StatusActionRecord>()
      .from('status_actions')
      .where('status_action_id', actionId)
      .first();

    if (!statusAction) {
      throw new GraphQLError(`Status action not found ${actionId}`);
    }

    return this.createStatusActionObject(statusAction);
  }

  async getStatusActions(): Promise<StatusAction[]> {
    const statusActions = await database
      .select<StatusActionRecord[]>('*')
      .from('status_actions');

    return statusActions.map((statusAction) =>
      this.createStatusActionObject(statusAction)
    );
  }

  async addConnectionStatusActions(
    connectionStatusActionsInput: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null> {
    const connectionStatusActionsToInsert =
      connectionStatusActionsInput.actions.map((item) => ({
        connection_id: connectionStatusActionsInput.connectionId,
        action_id: item.actionId,
        workflow_id: connectionStatusActionsInput.workflowId,
        config: item.config,
        entity_type: connectionStatusActionsInput.entityType,
      }));
    const connectionHasStatusActions:
      | (WorkflowConnectionHasActionsRecord &
          StatusActionRecord & {
            config: typeof ProposalStatusActionConfig;
          })[]
      | undefined = await database.transaction(async (trx) => {
      try {
        if (!connectionStatusActionsInput.actions.length) {
          const removedActions = await database
            .delete()
            .from('workflow_connection_has_actions')
            .where('connection_id', connectionStatusActionsInput.connectionId)
            .andWhere('workflow_id', connectionStatusActionsInput.workflowId)
            .andWhere('entity_type', entityType)
            .transacting(trx);

          return await trx.commit(removedActions);
        }
        const currentConnectionStatusActionsIds: number[] = await database
          .select('*')
          .from('workflow_connection_has_actions')
          .where('connection_id', connectionStatusActionsInput.connectionId) //TODO: ADD .andWhere('workflow_id', connectionStatusActionsInput.workflowId)
          .andWhere('entity_type', entityType)
          .transacting(trx)
          .then((results: WorkflowConnectionHasActionsRecord[]) => {
            return results.map((result) => result.action_id);
          });

        const connectionStatusActionsIdsToRemove =
          currentConnectionStatusActionsIds.filter(
            (actionId) =>
              !connectionStatusActionsInput.actions.find(
                (actionInput) => actionInput.actionId === actionId
              )
          );
        if (connectionStatusActionsIdsToRemove.length) {
          await database
            .delete()
            .from('workflow_connection_has_actions')
            .whereIn('action_id', connectionStatusActionsIdsToRemove)
            .where('connection_id', connectionStatusActionsInput.connectionId)
            .andWhere('workflow_id', connectionStatusActionsInput.workflowId)
            .andWhere('entity_type', entityType)
            .transacting(trx);
        }
        await database('workflow_connection_has_actions')
          .insert<
            WorkflowConnectionHasActionsRecord[]
          >(connectionStatusActionsToInsert)
          .onConflict(['connection_id', 'action_id'])
          .merge()
          .returning('*')
          .transacting(trx);

        const insertedStatusActions = await database
          .select('*')
          .from('workflow_connection_has_actions as wca')
          .join('status_actions as sa', {
            'wca.action_id': 'sa.status_action_id ',
          })
          .where('wca.connection_id', connectionStatusActionsInput.connectionId)
          .andWhere('wca.entity_type', entityType)
          .andWhere('sa.entity_type', entityType)
          .transacting(trx);

        return await trx.commit(insertedStatusActions);
      } catch (error) {
        logger.logException(
          `Failed to add status actions to connection input: ${JSON.stringify(
            connectionStatusActionsInput
          )}`,
          error
        );
      }
    });
    if (!connectionStatusActionsToInsert.length) {
      return null;
    }
    if (
      connectionHasStatusActions?.length !==
      connectionStatusActionsInput.actions.length
    ) {
      throw new Rejection('Failed to add status actions to connection', {
        connectionStatusActionsInput,
      });
    }

    return connectionHasStatusActions.map((item) =>
      this.createConnectionStatusActionObject(item)
    );
  }
}
