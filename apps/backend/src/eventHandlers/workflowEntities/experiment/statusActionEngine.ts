import { container } from 'tsyringe';

import { emailActionHandler } from './emailActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupExperimentSafetiesByProperties } from './utils';
import { Tokens } from '../../../config/Tokens';
import { StatusActionsDataSource } from '../../../datasources/StatusActionsDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { ExperimentSafety } from '../../../models/Experiment';
import { StatusActionType } from '../../../models/StatusAction';

export interface ExperimentSafetyWithWorkflowStatusConnectionId {
  experimentSafety: ExperimentSafety;
  workflowStatusConnectionId: number;
}

export const experimentSafetyStatusActionEngine = async (
  experimentSafeties: ExperimentSafetyWithWorkflowStatusConnectionId[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  const workflowDataSource: WorkflowDataSource = container.resolve(
    Tokens.WorkflowDataSource
  );

  const groupByProperties = ['workflowStatusConnectionId'];
  const groupResult = groupExperimentSafetiesByProperties(
    experimentSafeties,
    groupByProperties
  );

  return Promise.all(
    groupResult.map(async (groupedExperimentSafeties) => {
      const [{ workflowStatusConnectionId }] = groupedExperimentSafeties;
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
                groupedExperimentSafeties.map(
                  (experimentSafety) => experimentSafety.experimentSafety
                )
              );
              break;

            case StatusActionType.RABBITMQ:
              rabbitMQActionHandler(
                statusAction,
                groupedExperimentSafeties.map(
                  (experimentSafety) => experimentSafety.experimentSafety
                )
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
