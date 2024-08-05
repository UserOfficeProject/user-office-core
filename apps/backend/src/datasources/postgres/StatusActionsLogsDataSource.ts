import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import {
  StatusActionsLogHasProposal,
  StatusActionsLog,
} from '../../models/StatusActionsLog';
import {
  StatusActionsLogsArgs,
  StatusActionsLogsFilter,
} from '../../resolvers/queries/StatusActionsLogsQuery';
import { StatusActionsLogsDataSource } from '../StatusActionsLogsDataSource';
import database from './database';
import {
  StatusActionsLogHasProposalRecord,
  StatusActionsLogRecord,
} from './records';

export default class PostgresStatusActionsLogsDataSource
  implements StatusActionsLogsDataSource
{
  private createStatusActionsLogObject(
    statusActionLog: StatusActionsLogRecord
  ) {
    return new StatusActionsLog(
      statusActionLog.status_actions_log_id,
      statusActionLog.parent_status_actions_log_id,
      statusActionLog.connection_id,
      statusActionLog.action_id,
      statusActionLog.status_actions_step,
      statusActionLog.status_actions_by,
      statusActionLog.status_actions_successful,
      statusActionLog.status_actions_message,
      statusActionLog.status_actions_tstamp
    );
  }

  private createStatusActionsLogHasProposalsObject(
    statusActionLogHasProposal: StatusActionsLogHasProposalRecord
  ) {
    return new StatusActionsLogHasProposal(
      statusActionLogHasProposal.status_actions_log_id,
      statusActionLogHasProposal.proposal_pk
    );
  }

  async create(args: StatusActionsLogsArgs): Promise<StatusActionsLog> {
    const [statusActionLogRecord]: StatusActionsLogRecord[] =
      await database.transaction(async (trx) => {
        try {
          const statusActionsLog: StatusActionsLogRecord[] = await database
            .insert({
              parent_status_actions_log_id: args.parentStatusActionsLogId,
              connection_id: args.connectionId,
              action_id: args.actionId,
              status_actions_step: args.statusActionsStep,
              status_actions_by: args.statusActionsBy,
              status_actions_successful: args.statusActionsSuccessful,
              status_actions_message: args.statusActionsMessage,
            })
            .into('status_actions_logs')
            .returning('*')
            .transacting(trx);

          if (statusActionsLog[0].status_actions_log_id) {
            await database
              .insert(
                args.proposalPks.map((proposalPk) => ({
                  status_actions_log_id:
                    statusActionsLog[0].status_actions_log_id,
                  proposal_pk: proposalPk,
                }))
              )
              .into('status_actions_log_has_proposals')
              .transacting(trx);
          }

          return await trx.commit(statusActionsLog);
        } catch (error) {
          logger.logException(
            `Could not status actions log with args: '${JSON.stringify(args)}'`,
            error
          );
          throw new GraphQLError('Could not status actions log');
        }
      });

    return this.createStatusActionsLogObject(statusActionLogRecord);
  }
  async getStatusActionsLog(statusActionsLogId: number) {
    const statusActionsLog = await database
      .select<StatusActionsLogRecord>()
      .from('status_actions_logs')
      .where('status_actions_log_id', statusActionsLogId)
      .first();

    if (!statusActionsLog) {
      throw new GraphQLError(
        `Status actions log id not found id: ${statusActionsLogId}`
      );
    }

    return this.createStatusActionsLogObject(statusActionsLog);
  }

  async getStatusActionsLogReplays(statusActionsLogId: number) {
    return database
      .select('*')
      .from('status_actions_logs')
      .where('parent_status_actions_log_id', statusActionsLogId)
      .orderBy('status_actions_tstamp', 'asc')
      .then((statusActionsLogs: StatusActionsLogRecord[]) => {
        return statusActionsLogs.map((statusActionsLog) =>
          this.createStatusActionsLogObject(statusActionsLog)
        );
      });
  }
  async getStatusActionsLogs(filter?: StatusActionsLogsFilter) {
    return database
      .select('*')
      .from('status_actions_logs')
      .whereNull('parent_status_actions_log_id')
      .modify((query) => {
        if (filter?.statusActionsLogIds) {
          query.whereIn('status_actions_log_id', filter.statusActionsLogIds);
        }
        if (filter?.statusActionIds) {
          query.whereIn('action_id', filter.statusActionIds);
        }
        if (filter?.statusActionsMessage) {
          query.where(
            'status_actions_message',
            'like',
            `%${filter.statusActionsMessage}%`
          );
        }
        if (filter?.statusActionsSteps) {
          query.whereIn('status_actions_step', filter.statusActionsSteps);
        }
        if (filter?.statusActionsSuccessful) {
          query.where(
            'status_actions_successful',
            filter.statusActionsSuccessful
          );
        }
      })
      .orderBy('status_actions_tstamp', 'asc')
      .then((statusActionsLogs: StatusActionsLogRecord[]) => {
        return statusActionsLogs.map((statusActionsLog) =>
          this.createStatusActionsLogObject(statusActionsLog)
        );
      });
  }
  async getStatusActionsLogHasProposals(
    statusActionsLogId: number
  ): Promise<StatusActionsLogHasProposal[]> {
    return database
      .select<StatusActionsLogHasProposalRecord[]>('*')
      .from('status_actions_log_has_proposals')
      .where('status_actions_log_id', statusActionsLogId)
      .then(
        (statusActionsLogHasProposals: StatusActionsLogHasProposalRecord[]) => {
          return statusActionsLogHasProposals.map(
            (statusActionsLogHasProposal) =>
              this.createStatusActionsLogHasProposalsObject(
                statusActionsLogHasProposal
              )
          );
        }
      );
  }
}
