import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import {
  ConnectionHasStatusAction,
  ProposalStatusAction,
  ProposalStatusActionType,
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
  ProposalStatusActionRecord,
  ProposalWorkflowConnectionHasActionsRecord,
} from './records';

export default class PostgresStatusActionsDataSource
  implements StatusActionsDataSource
{
  private createStatusActionConfig(
    type: ProposalStatusActionType,
    config: typeof ProposalStatusActionConfig
  ) {
    switch (type) {
      case ProposalStatusActionType.EMAIL: {
        const blankConfig = new EmailActionConfig();

        return Object.assign(blankConfig, config);
      }
      case ProposalStatusActionType.RABBITMQ: {
        const blankConfig = new RabbitMQActionConfig();

        return Object.assign(blankConfig, config);
      }
      default:
        return null;
    }
  }

  private createConnectionStatusActionObject(
    proposalActionStatusRecord: ProposalWorkflowConnectionHasActionsRecord & {
      proposal_status_action_id: number;
      name: string;
      type: ProposalStatusActionType;
      config: typeof ProposalStatusActionConfig;
    }
  ) {
    return new ConnectionHasStatusAction(
      proposalActionStatusRecord.connection_id,
      proposalActionStatusRecord.proposal_status_action_id,
      proposalActionStatusRecord.workflow_id,
      proposalActionStatusRecord.name,
      proposalActionStatusRecord.type,
      this.createStatusActionConfig(
        proposalActionStatusRecord.type,
        proposalActionStatusRecord.config
      )
    );
  }

  private createProposalStatusActionObject(
    proposalActionStatusRecord: ProposalStatusActionRecord
  ) {
    return new ProposalStatusAction(
      proposalActionStatusRecord.proposal_status_action_id,
      proposalActionStatusRecord.name,
      proposalActionStatusRecord.description,
      proposalActionStatusRecord.type
    );
  }

  async getConnectionStatusActions(
    proposalWorkflowConnectionId: number,
    proposalWorkflowId: number
  ): Promise<ConnectionHasStatusAction[]> {
    const proposalActionStatusRecords: (ProposalStatusActionRecord &
      ProposalWorkflowConnectionHasActionsRecord & {
        config: typeof ProposalStatusActionConfig;
      })[] = await database
      .select()
      .from('status_actions as sa')
      .join('workflow_connection_has_actions as wca', {
        'wca.action_id': 'sa.status_action_id',
      })
      .where('wca.workflow_id', proposalWorkflowId)
      .andWhere('wca.connection_id', proposalWorkflowConnectionId)
      .andWhere('wca.entity_type', 'proposal');

    const proposalStatusActions = proposalActionStatusRecords.map(
      (proposalActionStatusRecord) =>
        this.createConnectionStatusActionObject(proposalActionStatusRecord)
    );

    return proposalStatusActions;
  }

  async getConnectionStatusAction(
    proposalWorkflowConnectionId: number,
    proposalStatusActionId: number
  ): Promise<ConnectionHasStatusAction> {
    const proposalActionStatusRecord: ProposalStatusActionRecord &
      ProposalWorkflowConnectionHasActionsRecord & {
        config: typeof ProposalStatusActionConfig;
      } = await database
      .select()
      .from('status_actions as sa')
      .join('workflow_connection_has_actions as wca', {
        'wca.action_id': 'sa.status_action_id',
      })
      .where('wca.action_id', proposalStatusActionId)
      .andWhere('wca.connection_id', proposalWorkflowConnectionId)
      .first();

    if (!proposalActionStatusRecord) {
      throw new GraphQLError(
        `Proposal status action not found ActionId: ${proposalStatusActionId} connectionId: ${proposalWorkflowConnectionId}`
      );
    }

    return this.createConnectionStatusActionObject(proposalActionStatusRecord);
  }

  async updateConnectionStatusAction(
    proposalStatusAction: ConnectionHasStatusAction
  ): Promise<ConnectionHasStatusAction> {
    const [
      updatedProposalAction,
    ]: (ProposalWorkflowConnectionHasActionsRecord & {
      config: typeof ProposalStatusActionConfig;
    })[] = await database
      .update(
        {
          config: proposalStatusAction.config,
        },
        ['*']
      )
      .from('workflow_connection_has_actions')
      .where('connection_id', proposalStatusAction.connectionId)
      .andWhere('action_id', proposalStatusAction.actionId)
      .andWhere('entity_type', 'proposal');

    if (!updatedProposalAction) {
      throw new GraphQLError(
        `ProposalStatusAction not found ${proposalStatusAction.actionId}`
      );
    }

    return this.createConnectionStatusActionObject({
      proposal_status_action_id: proposalStatusAction.actionId,
      name: proposalStatusAction.name,
      type: proposalStatusAction.type,
      ...updatedProposalAction,
    });
  }

  async getStatusAction(actionId: number): Promise<ProposalStatusAction> {
    const statusAction = await database
      .select<ProposalStatusActionRecord>()
      .from('status_actions')
      .where('proposal_status_action_id', actionId)
      .andWhere('entity_type', 'proposal')
      .first();

    if (!statusAction) {
      throw new GraphQLError(`Status action not found ${actionId}`);
    }

    return this.createProposalStatusActionObject(statusAction);
  }

  async getStatusActions(): Promise<ProposalStatusAction[]> {
    const statusActions = await database
      .select<ProposalStatusActionRecord[]>('*')
      .from('status_actions')
      .where('entity_type', 'proposal');

    return statusActions.map((statusAction) =>
      this.createProposalStatusActionObject(statusAction)
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
        entity_type: 'proposal',
      }));
    const connectionHasStatusActions:
      | (ProposalWorkflowConnectionHasActionsRecord &
          ProposalStatusActionRecord & {
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
            .andWhere('entity_type', 'proposal')
            .transacting(trx);

          return await trx.commit(removedActions);
        }
        const currentConnectionStatusActionsIds: number[] = await database
          .select('*')
          .from('workflow_connection_has_actions')
          .where('connection_id', connectionStatusActionsInput.connectionId)
          .andWhere('entity_type', 'proposal')
          .transacting(trx)
          .then((results: ProposalWorkflowConnectionHasActionsRecord[]) => {
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
            .andWhere('entity_type', 'proposal')
            .transacting(trx);
        }
        await database('workflow_connection_has_actions')
          .insert<
            ProposalWorkflowConnectionHasActionsRecord[]
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
          .andWhere('wca.entity_type', 'proposal')
          .andWhere('sa.entity_type', 'proposal')
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
