import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Rejection } from '../../models/Rejection';
import {
  ConnectionHasStatusAction,
  StatusAction,
  StatusActionType,
} from '../../models/StatusAction';
import { SetStatusActionsOnConnectionInput } from '../../resolvers/mutations/settings/SetStatusActionsOnConnectionMutation';
import {
  EmailActionConfig,
  StatusActionConfig,
  RabbitMQActionConfig,
} from '../../resolvers/types/StatusActionConfig';
import { StatusActionsDataSource } from '../StatusActionsDataSource';
import { WorkflowDataSource } from '../WorkflowDataSource';
import database from './database';
import {
  StatusActionRecord,
  WorkflowConnectionHasActionsRecord,
} from './records';

@injectable()
export default class PostgresStatusActionsDataSource
  implements StatusActionsDataSource
{
  constructor(
    @inject(Tokens.WorkflowDataSource)
    private workflowDataSource: WorkflowDataSource
  ) {}
  private createStatusActionConfig(
    type: StatusActionType,
    config: typeof StatusActionConfig
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
      workflow_status_action_id: number;
      type: StatusActionType;
      config: typeof StatusActionConfig;
    }
  ) {
    return new ConnectionHasStatusAction(
      actionStatusRecord.workflow_status_connection_id,
      actionStatusRecord.workflow_status_action_id,
      actionStatusRecord.workflow_id,
      actionStatusRecord.type,
      this.createStatusActionConfig(
        actionStatusRecord.type,
        actionStatusRecord.config
      )
    );
  }

  private createStatusActionObject(statusActionRecord: StatusActionRecord) {
    return new StatusAction(
      statusActionRecord.workflow_status_action_id,
      statusActionRecord.name,
      statusActionRecord.description,
      statusActionRecord.type
    );
  }

  async getConnectionStatusActions(
    workflowConnectionId: number,
    workflowId: number
  ): Promise<ConnectionHasStatusAction[]> {
    const statusActionRecords: (StatusActionRecord &
      WorkflowConnectionHasActionsRecord & {
        config: typeof StatusActionConfig;
      })[] = await database
      .select()
      .from('workflow_status_actions as wsa')
      .join('workflow_status_connection_has_workflow_status_actions as wca', {
        'wca.workflow_status_action_id': 'wsa.workflow_status_action_id',
      })
      .where('wca.workflow_id', workflowId)
      .andWhere('wca.workflow_status_connection_id', workflowConnectionId);

    const statusActions = statusActionRecords.map((statusActionRecord) =>
      this.createConnectionStatusActionObject(statusActionRecord)
    );

    return statusActions;
  }

  async getConnectionStatusAction(
    workflowConnectionId: number,
    statusActionId: number
  ): Promise<ConnectionHasStatusAction> {
    const statusActionRecord: StatusActionRecord &
      WorkflowConnectionHasActionsRecord & {
        config: typeof StatusActionConfig;
      } = await database
      .select()
      .from('workflow_status_actions as wsa')
      .join('workflow_status_connection_has_workflow_status_actions as wca', {
        'wca.workflow_status_action_id': 'wsa.workflow_status_action_id',
      })
      .where('wca.workflow_status_action_id', statusActionId)
      .andWhere('wca.workflow_status_connection_id', workflowConnectionId)
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
      config: typeof StatusActionConfig;
    })[] = await database
      .update(
        {
          config: statusAction.config,
        },
        ['*']
      )
      .from('workflow_status_connection_has_workflow_status_actions')
      .where('workflow_status_connection_id', statusAction.connectionId)
      .andWhere('workflow_status_action_id', statusAction.actionId);

    if (!updatedStatusAction) {
      throw new GraphQLError(`StatusAction not found ${statusAction.actionId}`);
    }

    return this.createConnectionStatusActionObject({
      type: statusAction.type,
      ...updatedStatusAction,
    });
  }

  async getStatusAction(actionId: number): Promise<StatusAction> {
    const statusAction = await database
      .select<StatusActionRecord>()
      .from('workflow_status_actions')
      .where('workflow_status_action_id', actionId)
      .first();

    if (!statusAction) {
      throw new GraphQLError(`Status action not found ${actionId}`);
    }

    return this.createStatusActionObject(statusAction);
  }

  async getStatusActions(): Promise<StatusAction[]> {
    const statusActions = await database
      .select<StatusActionRecord[]>('*')
      .from('workflow_status_actions');

    return statusActions.map((statusAction) =>
      this.createStatusActionObject(statusAction)
    );
  }

  async setStatusActionsOnConnection(
    connectionStatusActionsInput: SetStatusActionsOnConnectionInput
  ): Promise<ConnectionHasStatusAction[] | null> {
    const workflow = await this.workflowDataSource.getWorkflow(
      connectionStatusActionsInput.workflowId
    );

    if (!workflow) {
      throw new Rejection('Workflow not found', {
        connectionStatusActionsInput,
      });
    }

    const connectionStatusActionsToInsert =
      connectionStatusActionsInput.actions.map((item) => ({
        workflow_status_connection_id:
          connectionStatusActionsInput.connectionId,
        workflow_status_action_id: item.actionId,
        workflow_id: connectionStatusActionsInput.workflowId,
        config: item.config ?? null,
      }));
    const connectionHasStatusActions:
      | (WorkflowConnectionHasActionsRecord &
          StatusActionRecord & {
            config: typeof StatusActionConfig;
          })[]
      | undefined = await database.transaction(async (trx) => {
      try {
        if (!connectionStatusActionsInput.actions.length) {
          const removedActions = await database
            .delete()
            .from('workflow_status_connection_has_workflow_status_actions')
            .where(
              'workflow_status_connection_id',
              connectionStatusActionsInput.connectionId
            )
            .transacting(trx);

          return await trx.commit(removedActions);
        }
        const currentConnectionStatusActionsIds: number[] = await database
          .select('*')
          .from('workflow_status_connection_has_workflow_status_actions')
          .where(
            'workflow_status_connection_id',
            connectionStatusActionsInput.connectionId
          )
          .transacting(trx)
          .then((results: WorkflowConnectionHasActionsRecord[]) => {
            return results.map((result) => result.workflow_status_action_id);
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
            .from('workflow_status_connection_has_workflow_status_actions')
            .whereIn(
              'workflow_status_action_id',
              connectionStatusActionsIdsToRemove
            )
            .where(
              'workflow_status_connection_id',
              connectionStatusActionsInput.connectionId
            )
            .transacting(trx);
        }
        await database('workflow_status_connection_has_workflow_status_actions')
          .insert<
            WorkflowConnectionHasActionsRecord[]
          >(connectionStatusActionsToInsert)
          .onConflict([
            'workflow_status_connection_id',
            'workflow_status_action_id',
          ])
          .merge()
          .returning('*')
          .transacting(trx);

        const insertedStatusActions = await database
          .select('*')
          .from(
            'workflow_status_connection_has_workflow_status_actions as wsca'
          )
          .join('workflow_status_actions as wsa', {
            'wsca.workflow_status_action_id': 'wsa.workflow_status_action_id',
          })
          .where(
            'wsca.workflow_status_connection_id',
            connectionStatusActionsInput.connectionId
          )
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
