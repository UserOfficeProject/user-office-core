import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { searchObjectByKey } from '../utils/helperFunctions';
import {
  WorkflowEngineExperimentType,
  markExperimentSafetyEventAsDoneAndCallWorkflowEngine,
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

  const statusDataSource = container.resolve<StatusDataSource>(
    Tokens.StatusDataSource
  );
  updatedExperimentSafeties.map(async (updatedExperimentSafety) => {
    if (updatedExperimentSafety && updatedExperimentSafety.statusId) {
      const experimentSafetyStatus = await statusDataSource.getStatus(
        updatedExperimentSafety.statusId
      );
      const previousExperimentStatus = await statusDataSource.getStatus(
        updatedExperimentSafety.prevStatusId
      );

      return eventBus.publish({
        type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
        experimentsafety: updatedExperimentSafety,
        isRejection: false,
        key: 'experimentsafety',
        loggedInUserId: null,
        description: `From "${previousExperimentStatus?.name}" to "${experimentSafetyStatus?.name}"`,
      });
    }
  });
};

export const handleWorkflowEngineChange = async (
  event: ApplicationEvent,
  experimentPks: number[] | number
) => {
  const isArray = Array.isArray(experimentPks);
  const updatedExperimentSafeties =
    await markExperimentSafetyEventAsDoneAndCallWorkflowEngine(
      event.type,
      isArray ? experimentPks : [experimentPks]
    );

  if (
    event.type !== Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_USER &&
    updatedExperimentSafeties?.length
  ) {
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
    if (event.isRejection || event.blockWorkflow) {
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
