import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ExperimentSafetyEventsRecord } from '../datasources/postgres/records';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Event } from '../events/event.enum';
import { ExperimentSafety } from '../models/Experiment';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { Workflow } from '../models/Workflow';
import { WorkflowConnectionWithStatus } from '../models/WorkflowConnections';

const getExperimentWorkflowByCallId = (callId: number) => {
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  return callDataSource.getExperimentWorkflowByCall(callId);
};

export const getWorkflowConnectionByStatusId = (
  workflowId: number,
  statusId: number,
  prevStatusId?: number
) => {
  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  return workflowDataSource.getWorkflowConnectionsById(workflowId, statusId, {
    prevStatusId,
  });
};

const shouldMoveToNextStatus = (
  statusChangingEvents: StatusChangingEvent[],
  experimentSafetyEvents: ExperimentSafetyEventsRecord
): boolean => {
  const experimentSafetyEventsKeys = Object.keys(experimentSafetyEvents);
  const allExperimentIncompleteEvents = experimentSafetyEventsKeys.filter(
    (experimentSafetyEventsKey) =>
      !experimentSafetyEvents[
        experimentSafetyEventsKey as keyof ExperimentSafetyEventsRecord
      ]
  );

  const allNextStatusRulesFulfilled = !statusChangingEvents.some(
    (statusChangingEvent) =>
      allExperimentIncompleteEvents.indexOf(
        statusChangingEvent.statusChangingEvent.toLowerCase()
      ) >= 0
  );

  return allNextStatusRulesFulfilled;
};

const checkIfConditionsForNextStatusAreMet = async ({
  nextWorkflowConnections,
  experimentWorkflow,
  workflowDataSource,
  experimentSafetyWithEvents,
}: {
  nextWorkflowConnections: WorkflowConnectionWithStatus[];
  experimentWorkflow: Workflow;
  workflowDataSource: WorkflowDataSource;
  experimentSafetyWithEvents: {
    experimentPk: number;
    experimentSafetyEvents?: ExperimentSafetyEventsRecord;
    currentEvent: Event;
  };
}) => {
  for (const nextWorkflowConnection of nextWorkflowConnections) {
    if (!nextWorkflowConnection.nextStatusId) {
      continue;
    }

    const nextNextWorkflowConnections = await getWorkflowConnectionByStatusId(
      experimentWorkflow.id,
      nextWorkflowConnection.nextStatusId
    );
    const newStatusChangingEvents =
      await workflowDataSource.getStatusChangingEventsByConnectionIds(
        nextNextWorkflowConnections.map((connection) => connection.id)
      );

    if (!experimentSafetyWithEvents.experimentSafetyEvents) {
      return;
    }

    for (const sce of newStatusChangingEvents) {
      const experimentSafetyEventsKeys = Object.keys(
        experimentSafetyWithEvents.experimentSafetyEvents!
      );
      const allExperimnentSafetiesCompleteEvents =
        experimentSafetyEventsKeys.filter(
          (experimentSafetyEventsKey) =>
            experimentSafetyWithEvents.experimentSafetyEvents![
              experimentSafetyEventsKey as keyof ExperimentSafetyEventsRecord
            ]
        );

      const nextStatusRulesFulfilled =
        allExperimnentSafetiesCompleteEvents.includes(
          sce.statusChangingEvent.toLowerCase()
        );

      if (sce.statusChangingEvent && nextStatusRulesFulfilled)
        await workflowEngine([
          {
            currentEvent: sce.statusChangingEvent as Event,
            experimentSafetyEvents:
              experimentSafetyWithEvents.experimentSafetyEvents,
            experimentPk: experimentSafetyWithEvents.experimentPk,
          },
        ]);
    }
  }
};

export type WorkflowEngineExperimentType = ExperimentSafety & {
  workflowId: number;
  prevStatusId: number;
  callShortCode: string;
};

export const workflowEngine = async (
  args: {
    experimentPk: number;
    experimentSafetyEvents?: ExperimentSafetyEventsRecord;
    currentEvent: Event;
  }[]
): Promise<Array<WorkflowEngineExperimentType | void> | void> => {
  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const experimentWithChangedStatuses = (
    await Promise.all(
      args.map(async (experimentSafetyWithEvents) => {
        const experimentSafety =
          await experimentDataSource.getExperimentSafetyByExperimentPk(
            experimentSafetyWithEvents.experimentPk
          );

        if (!experimentSafety) {
          throw new Error(
            `Experiment Safety for the Experiment with Primary Key ${experimentSafetyWithEvents.experimentPk} not found`
          );
        }

        const experiment = await experimentDataSource.getExperiment(
          experimentSafetyWithEvents.experimentPk
        );
        if (!experiment) {
          throw new Error(
            `Experiment with Primary Key ${experimentSafetyWithEvents.experimentPk} not found`
          );
        }

        const proposal = await proposalDataSource.get(experiment.proposalPk);
        if (!proposal) {
          throw new Error(
            `Proposal with id ${experiment.proposalPk} not found`
          );
        }
        const experimentWorkflow = await getExperimentWorkflowByCallId(
          proposal.callId
        );

        if (!experimentWorkflow) {
          return;
        }
        if (!experimentSafety.statusId) return;

        const currentWorkflowConnections =
          await getWorkflowConnectionByStatusId(
            experimentWorkflow.id,
            experimentSafety.statusId
          );

        if (!currentWorkflowConnections.length) {
          return;
        }

        const callDataSource = container.resolve<CallDataSource>(
          Tokens.CallDataSource
        );

        const call = await callDataSource.getCall(proposal.callId);

        if (!call) {
          return;
        }

        /**
         * NOTE: We can have more than one current connection because of the multi-column workflows.
         * This is the way how we store the connection that has multiple next connections.
         * We have multiple separate connection records pointing to each next connection.
         * For example if we have status: FEASIBILITY_REVIEW which has multiple next statuses like: FAP_SELECTION and NOT_FEASIBLE.
         * We store one record of FEASIBILITY_REVIEW with nextStatusId = FAP_SELECTION and another one with nextStatusId = NOT_FEASIBLE.
         * We go through each record and based on the currentEvent we move the proposal into the right direction
         */
        return Promise.all(
          currentWorkflowConnections.map(async (currentWorkflowConnection) => {
            if (!currentWorkflowConnection.nextStatusId) {
              return;
            }

            if (!experimentSafetyWithEvents.experimentSafetyEvents) {
              return;
            }

            const nextWorkflowConnections =
              await getWorkflowConnectionByStatusId(
                experimentWorkflow.id,
                currentWorkflowConnection.nextStatusId,
                currentWorkflowConnection.statusId
              );
            if (!nextWorkflowConnections?.length) {
              return;
            }

            const workflowDataSource = container.resolve<WorkflowDataSource>(
              Tokens.WorkflowDataSource
            );

            const statusChangingEvents =
              await workflowDataSource.getStatusChangingEventsByConnectionIds(
                nextWorkflowConnections.map((connection) => connection.id)
              );
            if (!statusChangingEvents) {
              return;
            }

            const eventThatTriggeredStatusChangeIsStatusChangingEvent =
              statusChangingEvents.find(
                (statusChangingEvent) =>
                  experimentSafetyWithEvents.currentEvent ===
                  statusChangingEvent.statusChangingEvent
              );
            if (!eventThatTriggeredStatusChangeIsStatusChangingEvent) {
              return;
            }

            if (
              shouldMoveToNextStatus(
                statusChangingEvents,
                experimentSafetyWithEvents.experimentSafetyEvents
              )
            ) {
              const updatedExperimentSafety =
                await experimentDataSource.updateExperimentSafetyStatus(
                  experimentSafety.experimentSafetyPk,
                  currentWorkflowConnection.nextStatusId
                );

              if (updatedExperimentSafety) {
                await checkIfConditionsForNextStatusAreMet({
                  nextWorkflowConnections,
                  experimentWorkflow,
                  workflowDataSource,
                  experimentSafetyWithEvents,
                });

                return {
                  ...updatedExperimentSafety,
                  workflowId: experimentWorkflow.id,
                  prevStatusId: currentWorkflowConnection.statusId,
                  callShortCode: call.shortCode,
                };
              }
            }
          })
        );
      })
    )
  ).flat();

  // NOTE: Filter the undefined or null items in the array.
  const filteredExperimentsWithChangedStatuses =
    experimentWithChangedStatuses.filter(
      (p): p is WorkflowEngineExperimentType => !!p
    );

  // NOTE: Call the actions engine here
  // if (filteredExperimentsWithChangedStatuses.length) {
  //   proposalStatusActionEngine(filteredExperimentsWithChangedStatuses);
  // }

  return filteredExperimentsWithChangedStatuses;
};

export const markExperimentSafetyEventAsDoneAndCallWorkflowEngine = async (
  eventType: Event,
  experimentPks: number[]
) => {
  const ExperimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const allExperimentSafetyEvents =
    await ExperimentDataSource.markEventAsDoneOnExperimentSafeties(
      eventType,
      experimentPks
    );

  const experimentPksWithEvents = experimentPks.map((experimentPk) => {
    return {
      experimentPk,
      experimentSafetyEvents: allExperimentSafetyEvents?.find(
        (experimentSafetyEvents) =>
          experimentSafetyEvents.experiment_pk === experimentPk
      ),
      currentEvent: eventType,
    };
  });

  const updatedExperiments = await workflowEngine(experimentPksWithEvents);

  return updatedExperiments;
};
