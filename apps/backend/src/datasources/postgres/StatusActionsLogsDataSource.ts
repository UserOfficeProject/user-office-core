import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import {
  StatusActionsLogHasProposal,
  StatusActionsLog,
} from '../../models/StatusActionsLog';
import {
  StatusActionsLogsArgs,
  StatusActionsLogsFilterArgs,
} from '../../resolvers/queries/StatusActionsLogsQuery';
import { StatusActionsLogsDataSource } from '../StatusActionsLogsDataSource';
import database from './database';
import {
  StatusActionsLogHasProposalRecord,
  StatusActionsLogRecord,
} from './records';

const fieldMap: { [key: string]: string } = {
  statusActionsTstamp: 'status_actions_tstamp',
  statusActionsMessage: 'status_actions_message',
  statusActionsSuccessful: 'status_actions_successful',
  statusActionsStep: 'status_actions_step',
};
export default class PostgresStatusActionsLogsDataSource
  implements StatusActionsLogsDataSource
{
  private createStatusActionsLogObject(
    statusActionLog: StatusActionsLogRecord
  ) {
    return new StatusActionsLog(
      statusActionLog.status_actions_log_id,
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
  async update(args: StatusActionsLogsArgs): Promise<StatusActionsLog> {
    return database('status_actions_logs')
      .update({
        status_actions_message: args.statusActionsMessage,
        status_actions_by: args.statusActionsBy,
        status_actions_successful: args.statusActionsSuccessful,
      })
      .where({ status_actions_log_id: args.statusActionsLogId })
      .returning('*')
      .then((statusActionsLog) => {
        return this.createStatusActionsLogObject(statusActionsLog[0]);
      });
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

  async getStatusActionsLogs(
    args: StatusActionsLogsFilterArgs
  ): Promise<{ totalCount: number; statusActionsLogs: StatusActionsLog[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('status_actions_logs as sal')
      .distinct()
      .leftJoin(
        'status_actions_log_has_proposals as salhp',
        'salhp.status_actions_log_id',
        '=',
        'sal.status_actions_log_id'
      )
      .leftJoin('proposals as p', { 'p.proposal_pk': 'salhp.proposal_pk' })
      .modify((query) => {
        if (args.filter?.statusActionsLogIds) {
          query.whereIn(
            'sal.status_actions_log_id',
            args.filter.statusActionsLogIds
          );
        }
        if (args.filter?.statusActionIds) {
          query.whereIn('sal.action_id', args.filter.statusActionIds);
        }
        if (args.filter?.statusActionsMessage) {
          query.where(
            'sal.status_actions_message',
            'like',
            `%${args.filter.statusActionsMessage}%`
          );
        }
        if (args.filter?.statusActionsSteps) {
          query.whereIn(
            'sal.status_actions_step',
            args.filter.statusActionsSteps
          );
        }
        if (args.filter?.statusActionsSuccessful) {
          query.where(
            'sal.status_actions_successful',
            args.filter.statusActionsSuccessful
          );
        }
        if (args.sortField && args.sortDirection) {
          if (args.sortField in fieldMap) {
            query.orderByRaw(
              `${fieldMap[args.sortField]} ${args.sortDirection}`
            );
          } else {
            throw new GraphQLError(`Bad sort field given: ${args.sortField}`);
          }
        }
        if (args.searchText) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw(
                'sal.status_actions_message ILIKE ?',
                `%${args.searchText}%`
              )
              .orWhereRaw('p.proposal_id ILIKE ?', `%${args.searchText}%`)
              .orWhereRaw(
                'sal.status_actions_step ILIKE ?',
                `%${args.searchText}%`
              )
          );
        }
        if (args.first) {
          query.limit(args.first);
        }
        if (args.offset) {
          query.offset(args.offset);
        }
      })
      .then((results: StatusActionsLogRecord[]) => {
        const statusActionsLogs = results.map((statusActionsLog) =>
          this.createStatusActionsLogObject(statusActionsLog)
        );

        return {
          totalCount: results[0]?.full_count || 0,
          statusActionsLogs: statusActionsLogs,
        };
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