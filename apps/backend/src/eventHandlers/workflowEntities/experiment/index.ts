import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { experimentSafetyStatusActionEngine } from './statusActionEngine';
import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { ExperimentDataSource } from '../../../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../../../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../../../events';
import { Event } from '../../../events/event.enum';
import { ExperimentSafety } from '../../../models/Experiment';
import { WorkflowEngineType } from '../../../workflowEngine';
import { WorkFlowEntity } from '../../workflowHandler';

const experimentSafetyWorkflowEntity: WorkFlowEntity = {
  name: 'ExperimentSafety',
  exemptedEvents: [],
  extractionEntityKeys: ['experimentSafetyPk'],
  resolveWorkflowId: async (entityId: number) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const callDataSource = container.resolve<CallDataSource>(
      Tokens.CallDataSource
    );

    const experimentDataSource = container.resolve<ExperimentDataSource>(
      Tokens.ExperimentDataSource
    );

    const experimentSafety =
      await experimentDataSource.getExperimentSafety(entityId);

    if (!experimentSafety) {
      logger.logError('Experiment safety not found', { entityId });

      return;
    }

    const experiment = await experimentDataSource.getExperiment(
      experimentSafety.experimentPk
    );

    if (!experiment) {
      logger.logError('Experiment not found for experiment safety', {
        entityId,
        experimentPk: experimentSafety.experimentPk,
      });

      return;
    }
    const proposal = await proposalDataSource.get(experiment.proposalPk);

    if (!proposal) {
      logger.logError('Proposal not found', {
        experimentSafetyPk: entityId,
        proposalPk: experiment.proposalPk,
      });

      return;
    }

    const workflowId = (
      await callDataSource.getExperimentWorkflowByCall(proposal.callId)
    )?.id;

    if (!workflowId) {
      logger.logError('Experiment workflow not found for call', {
        experimentSafetyPk: entityId,
        callId: proposal.callId,
      });

      return;
    }

    return workflowId;
  },
  resolveCurrentStatusId: async (entityId: number) => {
    const experimentDataSource = container.resolve<ExperimentDataSource>(
      Tokens.ExperimentDataSource
    );
    const experimentSafety =
      await experimentDataSource.getExperimentSafety(entityId);

    return experimentSafety?.workflowStatusId;
  },
  updateWorkflowStatus: async (entityId: number, workflowStatusId: number) => {
    const experimentDataSource = container.resolve<ExperimentDataSource>(
      Tokens.ExperimentDataSource
    );
    await experimentDataSource.updateExperimentSafetyStatus(
      entityId,
      workflowStatusId
    );
  },
  onWorkflowStatusChange: async (entities: WorkflowEngineType[]) => {
    const workflowDataSource = container.resolve<WorkflowDataSource>(
      Tokens.WorkflowDataSource
    );
    const experimentDataSource = container.resolve<ExperimentDataSource>(
      Tokens.ExperimentDataSource
    );
    const eventBus = resolveApplicationEventBus();

    const experimentSafeties = await Promise.all(
      entities.map(async (entity) => {
        const {
          entityId,
          prevStatusId,
          nextStatusId,
          workflowStatusConnectionId,
        } = entity;

        const experimentSafety =
          await experimentDataSource.getExperimentSafety(entityId);

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

        await eventBus.publish({
          type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
          experimentsafety: experimentSafety,
          isRejection: false,
          key: 'experimentsafety',
          loggedInUserId: null,
          description: `From "${previousWorkflowStatus?.statusId}" to "${nextWorkflowStatus?.statusId}"`,
        });

        return { experimentSafety, workflowStatusConnectionId };
      })
    );

    const validExperimentSafeties = experimentSafeties.filter(
      (
        item
      ): item is {
        experimentSafety: ExperimentSafety;
        workflowStatusConnectionId: number;
      } => item != null
    );

    if (validExperimentSafeties.length > 0) {
      await experimentSafetyStatusActionEngine(validExperimentSafeties);
    }
  },
};

export default experimentSafetyWorkflowEntity;
