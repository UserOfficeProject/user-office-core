import {
  StatusActionsLog,
  StatusActionsLogHasProposal,
} from '../../models/StatusActionsLog';
import {
  StatusActionsLogsArgs,
  StatusActionsLogsFilterArgs,
} from '../../resolvers/queries/StatusActionsLogsQuery';
import { EmailStatusActionRecipients } from '../../resolvers/types/ProposalStatusActionConfig';
import { StatusActionsLogsDataSource } from '../StatusActionsLogsDataSource';

export const dummyStatusActionsLog = new StatusActionsLog(
  1,
  1,
  1,
  EmailStatusActionRecipients.OTHER,
  null,
  true,
  'Email(s) successfully sent',
  new Date()
);

export const dummyStatusActionsLogReplay = new StatusActionsLog(
  2,
  1,
  1,
  EmailStatusActionRecipients.OTHER,
  null,
  true,
  'Email(s) successfully sent',
  new Date()
);
export const dummyConnectionHasStatusAction = new StatusActionsLogHasProposal(
  1,
  1
);

export class StatusActionsLogsDataSourceMock
  implements StatusActionsLogsDataSource
{
  async create(args: StatusActionsLogsArgs): Promise<StatusActionsLog> {
    return { ...args, ...dummyStatusActionsLog };
  }
  async getStatusActionsLog(
    statusActionsLogId: number
  ): Promise<StatusActionsLog | null> {
    return dummyStatusActionsLog;
  }
  async getStatusActionsLogs(
    args: StatusActionsLogsFilterArgs
  ): Promise<{ totalCount: number; statusActionsLogs: StatusActionsLog[] }> {
    return { totalCount: 1, statusActionsLogs: [dummyStatusActionsLog] };
  }
  async getStatusActionsLogHasProposals(
    statusActionsLogId: number
  ): Promise<StatusActionsLogHasProposal[]> {
    return [dummyConnectionHasStatusAction];
  }
}
