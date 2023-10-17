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
      proposalActionStatusRecord.executed,
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
      .from('proposal_status_actions as psa')
      .join('proposal_workflow_connection_has_actions as pwca', {
        'pwca.action_id': 'psa.proposal_status_action_id',
      })
      .where('pwca.workflow_id', proposalWorkflowId)
      .andWhere('pwca.connection_id', proposalWorkflowConnectionId);

    const proposalStatusActions = proposalActionStatusRecords.map(
      (proposalActionStatusRecord) =>
        this.createConnectionStatusActionObject(proposalActionStatusRecord)
    );

    return proposalStatusActions;
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
          executed: proposalStatusAction.executed,
          config: proposalStatusAction.config,
        },
        ['*']
      )
      .from('proposal_workflow_connection_has_actions')
      .where('connection_id', proposalStatusAction.connectionId)
      .andWhere('action_id', proposalStatusAction.actionId);

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
      .from('proposal_status_actions')
      .where('proposal_status_action_id', actionId)
      .first();

    if (!statusAction) {
      throw new GraphQLError(`Status action not found ${actionId}`);
    }

    return this.createProposalStatusActionObject(statusAction);
  }

  async getStatusActions(): Promise<ProposalStatusAction[]> {
    const statusActions = await database
      .select<ProposalStatusActionRecord[]>('*')
      .from('proposal_status_actions');

    return statusActions.map((statusAction) =>
      this.createProposalStatusActionObject(statusAction)
    );
  }

  async addConnectionStatusActions(
    input: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null> {
    const dataToInsert = input.actions.map((item) => ({
      connection_id: input.connectionId,
      action_id: item.actionId,
      workflow_id: input.workflowId,
      executed: false,
      config: item.config,
    }));
    const connectionHasStatusActions:
      | (ProposalWorkflowConnectionHasActionsRecord &
          ProposalStatusActionRecord & {
            config: typeof ProposalStatusActionConfig;
          })[]
      | undefined = await database.transaction(async (trx) => {
      try {
        const removedActions = await database
          .delete()
          .from('proposal_workflow_connection_has_actions')
          .where('connection_id', input.connectionId)
          .andWhere('workflow_id', input.workflowId)
          .transacting(trx);

        if (!dataToInsert.length) {
          return await trx.commit(removedActions);
        }

        await database
          .insert<ProposalWorkflowConnectionHasActionsRecord[]>(dataToInsert)
          .into('proposal_workflow_connection_has_actions')
          .returning('*')
          .transacting(trx);

        const insertedStatusActions = await database
          .select('*')
          .from('proposal_workflow_connection_has_actions as pwca')
          .join('proposal_status_actions as psa', {
            'pwca.action_id': 'psa.proposal_status_action_id ',
          })
          .where('pwca.connection_id', input.connectionId)
          .transacting(trx);

        return await trx.commit(insertedStatusActions);
      } catch (error) {
        logger.logException(
          `Failed to add status actions to connection input: ${JSON.stringify(
            input
          )}`,
          error
        );
      }
    });

    if (!dataToInsert.length) {
      return null;
    }

    if (connectionHasStatusActions?.length !== input.actions.length) {
      throw new Rejection('Failed to add status actions to connection', {
        input,
      });
    }

    return connectionHasStatusActions.map((item) =>
      this.createConnectionStatusActionObject(item)
    );
  }
}
