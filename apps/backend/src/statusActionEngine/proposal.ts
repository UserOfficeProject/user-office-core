import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { StatusActionType } from '../models/StatusAction';
import { WorkflowEngineProposalType } from '../workflowEngine/proposal';
import { emailActionHandler } from './emailActionHandler';
import { proposalDownloadActionHandler } from './proposalDownloadActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupProposalsByProperties } from './statusActionUtils';

export const proposalStatusActionEngine = async (
  proposals: WorkflowEngineProposalType[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  const workflowDataSource: WorkflowDataSource = container.resolve(
    Tokens.WorkflowDataSource
  );

  // NOTE: We need to group the proposals by 'workflow' and 'status' because proposals coming in here can be from different workflows/calls.
  const groupByProperties = ['workflowId', 'statusId'];
  // NOTE: Here the result is something like: [[proposalsWithWorkflowStatusIdCombination1], [proposalsWithWorkflowStatusIdCombination2]...]
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
              emailActionHandler(statusAction, groupedProposals);
              break;

            case StatusActionType.RABBITMQ:
              rabbitMQActionHandler(statusAction, groupedProposals);
              break;

            case StatusActionType.PROPOSALDOWNLOAD:
              proposalDownloadActionHandler(statusAction, groupedProposals);
              break;

            default:
              break;
          }
        })
      );
    })
  );
};
