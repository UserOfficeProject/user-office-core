import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { searchObjectByKey } from '../utils/helperFunctions';
import {
  WorkflowEngineExperimentType,
  ExperimentWorkflowEngine,
} from '../workflowEngine/experiment';

enum ExperimentInformationKeys {
  ExperimentPk = 'experimentPk',
}

const publishExperimentSafetyStatusChange = async (
  updatedExperimentSafeties: (void | WorkflowEngineExperimentType)[]
) => {
  if (!updatedExperimentSafeties) {
    return;
  }
  const eventBus = resolveApplicationEventBus();

  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );
  updatedExperimentSafeties.map(async (updatedExperimentSafety) => {
    if (updatedExperimentSafety && updatedExperimentSafety.workflowStatusId) {
      const experimentSafetyStatus = await workflowDataSource.getWorkflowStatus(
        updatedExperimentSafety.workflowStatusId
      );
      const previousExperimentStatus =
        await workflowDataSource.getWorkflowStatus(
          updatedExperimentSafety.prevWorkflowStatusId
        );

      return eventBus.publish({
        type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
        experimentsafety: updatedExperimentSafety,
        isRejection: false,
        key: 'experimentsafety',
        loggedInUserId: null,
        description: `From "${previousExperimentStatus?.statusId}" to "${experimentSafetyStatus?.statusId}"`,
      });
    }
  });
};

export const handleWorkflowEngineChange = async (
  event: ApplicationEvent,
  experimentPks: number[] | number
) => {
  const isArray = Array.isArray(experimentPks);

  const workflowEngine = container.resolve(ExperimentWorkflowEngine);
  const updatedExperimentSafeties = await workflowEngine.run({
    event: event.type,
    experimentPks: isArray ? experimentPks : [experimentPks],
  });

  if (
    event.type !== Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_USER &&
    updatedExperimentSafeties?.length
  ) {
    // publish event EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW to the EventBus
    await publishExperimentSafetyStatusChange(updatedExperimentSafeties);
  }
};

const extractExperimentInformationFromEvent = (event: ApplicationEvent) => {
  let experimentInformationObject, experimentInformationKey;
  const experimentKeysToLookFor = Object.values(ExperimentInformationKeys);
  // NOTE: Go through the event object and try to find some of the ExperimentInformationKeys.
  for (const key of experimentKeysToLookFor) {
    experimentInformationObject = searchObjectByKey(event, key);

    if (
      experimentInformationObject &&
      experimentInformationObject[key as keyof object]
    ) {
      experimentInformationKey = key;

      break;
    }
  }

  return { experimentInformationObject, experimentInformationKey };
};

export default function createExperimentSafetyWorkflowHandler() {
  // Handler to align input for workflowEngine
  return async function experimentSafetyWorkflowHandler(
    event: ApplicationEvent
  ) {
    // if the original method failed
    // there is no point of moving forward in the workflow
    if (event.isRejection) {
      return;
    }
    const { experimentInformationObject, experimentInformationKey } =
      extractExperimentInformationFromEvent(event);

    // If none of the ExperimentInformationKeys found then it is not a proposal event
    if (!experimentInformationObject || !experimentInformationKey) {
      return;
    }

    const experimentInformationValue =
      experimentInformationObject?.[experimentInformationKey as keyof object];
    if (experimentInformationValue) {
      switch (experimentInformationKey) {
        case ExperimentInformationKeys.ExperimentPk:
          handleWorkflowEngineChange(event, experimentInformationValue);
          break;
        default:
          break;
      }
    }
  };
}
