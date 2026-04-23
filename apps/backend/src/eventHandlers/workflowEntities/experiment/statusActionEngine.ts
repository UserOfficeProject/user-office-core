import { container } from 'tsyringe';

import { emailActionHandler } from './emailActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupExperimentSafetiesByProperties } from './utils';
import { Tokens } from '../../../config/Tokens';
import { StatusActionsDataSource } from '../../../datasources/StatusActionsDataSource';
import { ExperimentSafety } from '../../../models/Experiment';
import { StatusActionType } from '../../../models/StatusAction';
import { WorkflowEngineType } from '../../../workflowEngine';

export const experimentSafetyStatusActionEngine = async (
  experimentSafetyWithConnection: {
    experimentSafety: ExperimentSafety;
    entity: WorkflowEngineType;
  }[]
) => {
  const statusActionsDataSource: StatusActionsDataSource = container.resolve(
    Tokens.StatusActionsDataSource
  );

  const groupByProperties = ['workflowId', 'statusId'];
  const groupResult = groupExperimentSafetiesByProperties(
    experimentSafetyWithConnection,
    groupByProperties
  );
  Promise.all(
    groupResult.map(async (groupedExperimentSafetiesWithConnection) => {
      const [
        {
          entity: { workflowStatusConnectionId },
        },
      ] = groupedExperimentSafetiesWithConnection;

      const statusActions =
        await statusActionsDataSource.getConnectionStatusActions(
          workflowStatusConnectionId
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
                groupedExperimentSafetiesWithConnection.map(
                  ({ experimentSafety }) => experimentSafety
                )
              );
              break;

            case StatusActionType.RABBITMQ:
              rabbitMQActionHandler(
                statusAction,
                groupedExperimentSafetiesWithConnection.map(
                  ({ experimentSafety }) => experimentSafety
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
