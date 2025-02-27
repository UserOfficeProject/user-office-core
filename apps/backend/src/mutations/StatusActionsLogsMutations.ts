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
import { StatusActionsLog } from '../models/StatusActionsLog';
import { UserWithRole } from '../models/User';
import { EmailStatusActionRecipients } from '../resolvers/types/ProposalStatusActionConfig';
import { emailActionHandler } from '../statusActionEngine/emailActionHandler';
import { WorkflowEngineProposalType } from '../workflowEngine';

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
          workflowId: proposalWorkflow.id,
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

    emailActionHandler(statusAction, workflowEngineProposals, {
      statusActionsLogId: statusActionsLog.statusActionsLogId,
      loggedInUserId: agent?.id,
      statusActionRecipients:
        statusActionsLog.emailStatusActionRecipient as EmailStatusActionRecipients,
    });

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  async replayStatusActionsLog(
    agent: UserWithRole | null,
    statusActionsLogId: number
  ): Promise<boolean | Rejection> {
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

    return this.executeStatusActionsLog(statusActionsLog, agent);
  }
}
