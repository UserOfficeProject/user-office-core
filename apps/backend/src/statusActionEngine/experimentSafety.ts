import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { StatusActionType } from '../models/StatusAction';
import {
  WorkflowEngineExperimentType,
  getWorkflowConnectionByStatusId,
} from '../workflowEngine/experiment';
import { emailActionHandler } from './emailActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';

export const experimentSafetyStatusActionEngine = async (
  experiments: WorkflowEngineExperimentType[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  // NOTE: We need to group the proposals by 'workflow' and 'status' because proposals coming in here can be from different workflows/calls.
  const groupByProperties = ['workflowId', 'statusId'];
  // NOTE: Here the result is something like: [[proposalsWithWorkflowStatusIdCombination1], [proposalsWithWorkflowStatusIdCombination2]...]
  // const groupResult = groupProposalsByProperties(
  //   experiments,
  //   groupByProperties
  // );
  const groupResult: any = [];
  Promise.all(
    groupResult.map(async (groupedProposals: any) => {
      // NOTE: We get the needed ids from the first proposal in the group.
      const [{ workflowId, statusId, prevStatusId }] = groupedProposals;

      const [currentConnection] = await getWorkflowConnectionByStatusId(
        workflowId,
        statusId,
        prevStatusId
      );

      if (!currentConnection) {
        return;
      }

      const statusActions =
        await statusActionsDataSource.getConnectionStatusActions(
          currentConnection.id,
          currentConnection.workflowId
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

            default:
              break;
          }
        })
      );
    })
  );
};
