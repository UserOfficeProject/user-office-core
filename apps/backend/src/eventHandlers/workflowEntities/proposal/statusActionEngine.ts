import { container } from 'tsyringe';

import { emailActionHandler } from './emailActionHandler';
import { pdfDownloadActionHandler } from './pdfDownloadActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupProposalsByProperties } from './utils';
import { Tokens } from '../../../config/Tokens';
import { StatusActionsDataSource } from '../../../datasources/StatusActionsDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { Proposal } from '../../../models/Proposal';
import { StatusActionType } from '../../../models/StatusAction';

export interface ProposalWithWorkflowStatusConnectionId {
  proposal: Proposal;
  workflowStatusConnectionId: number;
}

export const proposalStatusActionEngine = async (
  proposals: ProposalWithWorkflowStatusConnectionId[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  const workflowDataSource: WorkflowDataSource = container.resolve(
    Tokens.WorkflowDataSource
  );

  const groupByProperties = ['workflowStatusConnectionId'];
  const groupResult = groupProposalsByProperties(proposals, groupByProperties);
  Promise.all(
    groupResult.map(async (groupedProposals) => {
      // NOTE: We get the needed ids from the first proposal in the group.
      const [{ workflowStatusConnectionId }] = groupedProposals;
      const currentConnection = await workflowDataSource.getWorkflowConnection(
        workflowStatusConnectionId
      );
      if (!currentConnection) {
        return;
      }
      const statusActions =
        await statusActionsDataSource.getConnectionStatusActions(
          currentConnection.id
        );
      if (!statusActions?.length) {
        return;
      }

      Promise.all(
        statusActions.map(async (statusAction) => {
          if (!statusAction.actionId || !statusAction.type) {
            return;
          }

          switch (statusAction.type) {
            case StatusActionType.EMAIL:
              emailActionHandler(
                statusAction,
                groupedProposals.map((proposal) => proposal.proposal)
              );
              break;

            case StatusActionType.RABBITMQ:
              rabbitMQActionHandler(
                statusAction,
                groupedProposals.map((proposal) => proposal.proposal)
              );
              break;

            case StatusActionType.PROPOSALDOWNLOAD:
              pdfDownloadActionHandler(
                statusAction,
                groupedProposals.map((proposal) => proposal.proposal)
              );
              break;

            default:
              break;
          }
        })
      );
    })
  );
};
