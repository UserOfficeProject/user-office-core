import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import ExperimentDataSource from '../../../datasources/postgres/ExperimentDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../../../events';
import { Event } from '../../../events/event.enum';
import { WorkflowEngineType } from '../../../workflowEngine';
import { WorkFlowEntity } from '../../workflowHandler';

const experimentDataSource = container.resolve(ExperimentDataSource);

const experimentSafetyWorkflowEntity: WorkFlowEntity = {
  name: 'ExperimentSafety',
  exemptedEvents: [],
  extractionEntityKeys: ['experimentsafety'],
  resolveWorkflowId: async (entityId: number) => {
    const experimentSafety =
      await experimentDataSource.getExperimentSafetyByExperimentPk(entityId);

    return experimentSafety?.workflowStatusId;
  },
  resolveCurrentStatusId: async (entityId: number) => {
    const experimentSafety =
      await experimentDataSource.getExperimentSafetyByExperimentPk(entityId);

    return experimentSafety?.workflowStatusId;
  },
  updateWorkflowStatus: async (entityId: number, workflowStatusId: number) => {
    await experimentDataSource.updateExperimentSafetyStatus(
      entityId,
      workflowStatusId
    );
  },
  onWorkflowStatusChange: async (entities: WorkflowEngineType[]) => {
    const workflowDataSource = container.resolve<WorkflowDataSource>(
      Tokens.WorkflowDataSource
    );
    const eventBus = resolveApplicationEventBus();

    const experimentSafeties = await Promise.all(
      entities.map(async (entity) => {
        const experimentSafety =
          await experimentDataSource.getExperimentSafetyByExperimentPk(
            entity.entityId
          );

        if (!experimentSafety) {
          logger.logError('Experiment not found for workflow status change', {
            entityId: entity.entityId,
          });

          return;
        }

        const previousWorkflowStatus =
          await workflowDataSource.getWorkflowStatus(entity.prevStatusId);
        const nextWorkflowStatus = await workflowDataSource.getWorkflowStatus(
          entity.nextStatusId
        );

        await eventBus.publish({
          type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
          experimentsafety: experimentSafety,
          isRejection: false,
          key: 'experimentsafety',
          loggedInUserId: null,
          description: `From "${previousWorkflowStatus?.statusId}" to "${nextWorkflowStatus?.statusId}"`,
        });

        return experimentSafety;
      })
    );
  },
};

export default experimentSafetyWorkflowEntity;
