import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import ProposalDataSource from '../datasources/postgres/ProposalDataSource';
import StatusActionsDataSource from '../datasources/postgres/StatusActionsDataSource';
import StatusActionsLogsDataSource from '../datasources/postgres/StatusActionsLogsDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { StatusActionType } from '../models/StatusAction';
import { StatusActionsLog } from '../models/StatusActionsLog';
import { UserWithRole } from '../models/User';
import {
  ReplayStatusActionsLogsResult,
  ReplayStatusLogFailure,
} from '../resolvers/mutations/ReplayStatusActionsLogMutation';
import { EmailStatusActionRecipients } from '../resolvers/types/StatusActionConfig';
import { emailActionHandler } from '../statusActionEngine/emailActionHandler';
import { proposalDownloadActionHandler } from '../statusActionEngine/proposalDownloadActionHandler';
import { WorkflowEngineProposalType } from '../workflowEngine/proposal';

@injectable()
export default class StatusActionsLogsMutations {
  constructor(
    @inject(Tokens.StatusActionsLogsDataSource)
    private statusActionsLogsDataSource: StatusActionsLogsDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.StatusActionsDataSource)
    private statusActionsDataSource: StatusActionsDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource
  ) {}

  private async getStatusEngineReadyProposals(
    proposals: Proposal[]
  ): Promise<WorkflowEngineProposalType[]> {
    if (proposals.length < 1) {
      return [];
    }
    const fullProposals = await Promise.all(
      proposals.map(async (proposal) => {
        if (!proposal) {
          return null;
        }

        const proposalWorkflow =
          await this.callDataSource.getProposalWorkflowByCall(proposal.callId);

        if (!proposalWorkflow) {
          return null;
        }

        return {
          ...proposal,
        };
      })
    );

    return fullProposals.filter(
      (item): item is WorkflowEngineProposalType => !!item
    );
  }
  private async executeStatusActionsLog(
    statusActionsLog: StatusActionsLog,
    agent: UserWithRole | null
  ): Promise<boolean | Rejection> {
    const proposalsPks = await this.statusActionsLogsDataSource
      .getStatusActionsLogHasProposals(statusActionsLog.statusActionsLogId)
      .then((results) =>
        results.map((proposalsPks) => proposalsPks.proposalPk)
      );
    if (!proposalsPks || proposalsPks.length < 1) {
      return rejection('Could not retrieve status actions log proposals ids', {
        statusActionsLog,
      });
    }
    const statusAction =
      await this.statusActionsDataSource.getConnectionStatusAction(
        statusActionsLog.connectionId,
        statusActionsLog.actionId
      );
    if (!statusAction) {
      return rejection(
        'Could not retrieve status actions log connection status actions',
        {
          statusActionsLog,
        }
      );
    }
    const proposals =
      await this.proposalDataSource.getProposalsByPks(proposalsPks);
    if (!proposals || proposals.length < 1) {
      return rejection('Could not retrieve status actions log proposals', {
        statusActionsLog,
      });
    }
    const workflowEngineProposals =
      await this.getStatusEngineReadyProposals(proposals);
    if (!workflowEngineProposals || workflowEngineProposals.length < 1) {
      return rejection(
        'Could not generate status actions log workflow engine proposals',
        {
          statusActionsLog,
        }
      );
    }

    switch (statusAction.type) {
      case StatusActionType.EMAIL:
        await emailActionHandler(statusAction, workflowEngineProposals, {
          statusActionsLogId: statusActionsLog.statusActionsLogId,
          loggedInUserId: agent?.id,
          statusActionRecipients:
            statusActionsLog.emailStatusActionRecipient as EmailStatusActionRecipients,
        });

        break;
      case StatusActionType.PROPOSALDOWNLOAD:
        await proposalDownloadActionHandler(
          statusAction,
          workflowEngineProposals,
          {
            statusActionsLogId: statusActionsLog.statusActionsLogId,
            loggedInUserId: agent?.id,
          }
        );

        break;
      default:
        return rejection('Status action type does not support replay', {
          statusActionsLog,
          statusAction,
        });
    }

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  async replayStatusActionsLog(
    agent: UserWithRole | null,
    statusActionsLogId: number
  ): Promise<boolean | Rejection> {
    logger.logInfo(`Replaying status action log: ${statusActionsLogId}`, {
      agent,
      statusActionsLogId,
    });

    const statusActionsLog =
      await this.statusActionsLogsDataSource.getStatusActionsLog(
        statusActionsLogId
      );

    if (!statusActionsLog) {
      return rejection('Could not retrieve status actions log', {
        agent,
        statusActionsLogId,
      });
    }

    return await this.executeStatusActionsLog(statusActionsLog, agent);
  }

  @Authorized([Roles.USER_OFFICER])
  async replayStatusActionsLogs(
    agent: UserWithRole | null,
    statusActionsLogIds: number[]
  ): Promise<ReplayStatusActionsLogsResult> {
    const successful: number[] = [];
    const failed: ReplayStatusLogFailure[] = [];

    logger.logInfo(
      `Starting replay of ${statusActionsLogIds.length} status action logs.`,
      {}
    );

    for (const logId of statusActionsLogIds) {
      const result = await this.replayStatusActionsLog(agent, logId);

      if (result instanceof Rejection) {
        failed.push({ logId, error: result.message });
      } else {
        successful.push(logId);
      }
    }

    const results: ReplayStatusActionsLogsResult = {
      totalRequested: statusActionsLogIds.length,
      successful,
      failed,
    };

    logger.logInfo(
      `Completed replay of ${statusActionsLogIds.length} status action logs. Successful: ${results.successful.length}. Failed: ${results.failed.length}.`,
      { results }
    );

    return results;
  }
}
