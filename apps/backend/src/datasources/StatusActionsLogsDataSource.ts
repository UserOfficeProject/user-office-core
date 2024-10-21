import {
  StatusActionsLog,
  StatusActionsLogHasProposal,
} from '../models/StatusActionsLog';
import {
  StatusActionsLogsArgs,
  StatusActionsLogsFilterArgs,
} from '../resolvers/queries/StatusActionsLogsQuery';

export interface StatusActionsLogsDataSource {
  create(args: StatusActionsLogsArgs): Promise<StatusActionsLog>;

  getStatusActionsLog(
    statusActionsLogId: number
  ): Promise<StatusActionsLog | null>;
  getStatusActionsLogs(
    args: StatusActionsLogsFilterArgs
  ): Promise<{ totalCount: number; statusActionsLogs: StatusActionsLog[] }>;
  getStatusActionsLogHasProposals(
    statusActionsLogId: number
  ): Promise<StatusActionsLogHasProposal[]>;
}
