import {
  StatusActionsLog,
  StatusActionsLogHasProposal,
} from '../models/StatusActionsLog';
import {
  StatusActionsLogsArgs,
  StatusActionsLogsFilter,
} from '../resolvers/queries/StatusActionsLogsQuery';

export interface StatusActionsLogsDataSource {
  create(args: StatusActionsLogsArgs): Promise<StatusActionsLog>;

  getStatusActionsLog(
    statusActionsLogId: number
  ): Promise<StatusActionsLog | null>;
  getStatusActionsLogs(
    filter?: StatusActionsLogsFilter
  ): Promise<StatusActionsLog[] | null>;
  getStatusActionsLogHasProposals(
    statusActionsLogId: number
  ): Promise<StatusActionsLogHasProposal[]>;
}
