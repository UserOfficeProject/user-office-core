import { container } from 'tsyringe';

import { emailActionHandler } from './emailActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupExperimentSafetiesByProperties } from './utils';
import { Tokens } from '../../../config/Tokens';
import { StatusActionsDataSource } from '../../../datasources/StatusActionsDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { ExperimentSafety } from '../../../models/Experiment';
import { StatusActionType } from '../../../models/StatusAction';

export const experimentSafetyStatusActionEngine = async (
  experimentSafeties: ExperimentSafety[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  const workflowDataSource: WorkflowDataSource = container.resolve(
    Tokens.WorkflowDataSource
  );

  const groupByProperties = ['workflowStatusId'];
  const groupResult = groupExperimentSafetiesByProperties(
    experimentSafeties,
    groupByProperties
  );
  Promise.all(
    groupResult.map(async (groupedExperimentSafeties) => {
      const [{ workflowStatusId }] = groupedExperimentSafeties;
      const currentConnection =
        await workflowDataSource.getWorkflowConnectionByNextStatusId(
          workflowStatusId
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
              emailActionHandler(statusAction, groupedExperimentSafeties);
              break;

            case StatusActionType.RABBITMQ:
              rabbitMQActionHandler(statusAction, groupedExperimentSafeties);
              break;

            default:
              break;
          }
        })
      );
    })
  );
};
