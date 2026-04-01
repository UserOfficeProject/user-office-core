import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import ExperimentDataSource from '../../datasources/postgres/ExperimentDataSource';
import { WorkflowDataSource } from '../../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { WorkFlowEntity } from '../workflowHandler';

const experimentDataSource = container.resolve(ExperimentDataSource);

const experimentSafetyWorkflowEntity: WorkFlowEntity = {
  name: 'ExperimentSafety',
  exemptedEvents: [],
  extractionEntityKeys: ['experimentsafety'],
  resolveWorkflowId: async (entityId: number) => {
    // For now, we are assuming that there is only one workflow for experiment safety. In future, if there are multiple workflows for experiment safety, we can use the event type to determine the workflow id.
    const experimentSafety =
      await experimentDataSource.getExperimentSafetyByExperimentPk(entityId);

    if (!experimentSafety) {
      logger.logError('Experiment not found', { entityId });

      return;
    }

    const { workflowStatusId } = experimentSafety;

    if (!workflowStatusId) {
      logger.logError('Workflow not found for experiment safety', { entityId });

      return;
    }

    return workflowStatusId;
  },
  resolveCurrentStatusId: async (entityId: number) => {
    const experimentSafety =
      await experimentDataSource.getExperimentSafetyByExperimentPk(entityId);

    if (!experimentSafety) {
      logger.logError('Experiment not found', { entityId });

      return;
    }

    if (!experimentSafety.workflowStatusId) {
      logger.logError('Workflow status id not found for experiment safety', {
        entityId,
      });

      return;
    }

    return experimentSafety.workflowStatusId;
  },
  updateWorkflowStatus: async (entityId: number, workflowStatusId: number) => {
    await experimentDataSource.updateExperimentSafetyStatus(
      entityId,
      workflowStatusId
    );
  },
  onWorkflowStatusChange: async (
    entityId: number,
    prevStatusId: number,
    nextStatusId: number
  ) => {
    const workflowDataSource = container.resolve<WorkflowDataSource>(
      Tokens.WorkflowDataSource
    );
    const eventBus = resolveApplicationEventBus();

    const experimentSafety =
      await experimentDataSource.getExperimentSafetyByExperimentPk(entityId);

    if (!experimentSafety) {
      logger.logError('Experiment not found for workflow status change', {
        entityId,
      });

      return;
    }

    const previousWorkflowStatus =
      await workflowDataSource.getWorkflowStatus(prevStatusId);
    const nextWorkflowStatus =
      await workflowDataSource.getWorkflowStatus(nextStatusId);

    return eventBus.publish({
      type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
      experimentsafety: experimentSafety,
      isRejection: false,
      key: 'experimentsafety',
      loggedInUserId: null,
      description: `From "${previousWorkflowStatus?.statusId}" to "${nextWorkflowStatus?.statusId}"`,
    });
  },
};

export default experimentSafetyWorkflowEntity;
