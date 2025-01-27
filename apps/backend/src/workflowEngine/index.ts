import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalEventsRecord } from '../datasources/postgres/records';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { WorkflowConnectionWithStatus } from '../models/WorkflowConnections';
import { statusActionEngine } from '../statusActionEngine';

const getProposalWorkflowByCallId = (callId: number) => {
  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );

  return proposalSettingsDataSource.getProposalWorkflowByCall(callId);
};

export const getProposalWorkflowConnectionByStatusId = (
  proposalWorkflowId: number,
  proposalStatusId: number,
  prevStatusId?: number
) => {
  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  return workflowDataSource.getWorkflowConnectionsById(
    proposalWorkflowId,
    proposalStatusId,
    'proposal',
    { prevStatusId }
  );
};

const shouldMoveToNextStatus = (
  statusChangingEvents: StatusChangingEvent[],
  proposalEvents: ProposalEventsRecord
): boolean => {
  const proposalEventsKeys = Object.keys(proposalEvents);
  const allProposalIncompleteEvents = proposalEventsKeys.filter(
    (proposalEventsKey) =>
      !proposalEvents[proposalEventsKey as keyof ProposalEventsRecord]
  );

  const allNextStatusRulesFulfilled = !statusChangingEvents.some(
    (statusChangingEvent) =>
      allProposalIncompleteEvents.indexOf(
        statusChangingEvent.statusChangingEvent.toLowerCase()
      ) >= 0
  );

  return allNextStatusRulesFulfilled;
};

const checkIfConditionsForNextStatusAreMet = async ({
  nextWorkflowConnections,
  proposalWorkflow,
  workflowDataSource,
  proposalWithEvents,
}: {
  nextWorkflowConnections: WorkflowConnectionWithStatus[];
  proposalWorkflow: ProposalWorkflow;
  workflowDataSource: WorkflowDataSource;
  proposalWithEvents: {
    proposalPk: number;
    proposalEvents?: ProposalEventsRecord;
    currentEvent: Event;
  };
}) => {
  for (const nextWorkflowConnection of nextWorkflowConnections) {
    if (!nextWorkflowConnection.nextStatusId) {
      continue;
    }

    const nextNextWorkflowConnections =
      await getProposalWorkflowConnectionByStatusId(
        proposalWorkflow.id,
        nextWorkflowConnection.nextStatusId
      );
    const newStatusChangingEvents =
      await workflowDataSource.getStatusChangingEventsByConnectionIds(
        nextNextWorkflowConnections.map((connection) => connection.id),
        'proposal'
      );

    if (!proposalWithEvents.proposalEvents) {
      return;
    }

    for (const sce of newStatusChangingEvents) {
      const proposalEventsKeys = Object.keys(
        proposalWithEvents.proposalEvents!
      );
      const allProposalCompleteEvents = proposalEventsKeys.filter(
        (proposalEventsKey) =>
          proposalWithEvents.proposalEvents![
            proposalEventsKey as keyof ProposalEventsRecord
          ]
      );

      const nextStatusRulesFulfilled = allProposalCompleteEvents.includes(
        sce.statusChangingEvent.toLowerCase()
      );

      if (sce.statusChangingEvent && nextStatusRulesFulfilled)
        await workflowEngine([
          {
            currentEvent: sce.statusChangingEvent as Event,
            proposalEvents: proposalWithEvents.proposalEvents,
            proposalPk: proposalWithEvents.proposalPk,
          },
        ]);
    }
  }
};

export type WorkflowEngineProposalType = Proposal & {
  workflowId: number;
  prevStatusId: number;
  callShortCode: string;
};

export const workflowEngine = async (
  args: {
    proposalPk: number;
    proposalEvents?: ProposalEventsRecord;
    currentEvent: Event;
  }[]
): Promise<Array<WorkflowEngineProposalType | void> | void> => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const proposalsWithChangedStatuses = (
    await Promise.all(
      args.map(async (proposalWithEvents) => {
        const proposal = await proposalDataSource.get(
          proposalWithEvents.proposalPk
        );

        if (!proposal) {
          throw new Error(
            `Proposal with id ${proposalWithEvents.proposalPk} not found`
          );
        }

        const proposalWorkflow = await getProposalWorkflowByCallId(
          proposal.callId
        );

        if (!proposalWorkflow) {
          return;
        }

        const currentWorkflowConnections =
          await getProposalWorkflowConnectionByStatusId(
            proposalWorkflow.id,
            proposal.statusId
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

            if (!proposalWithEvents.proposalEvents) {
              return;
            }

            const nextWorkflowConnections =
              await getProposalWorkflowConnectionByStatusId(
                proposalWorkflow.id,
                currentWorkflowConnection.nextStatusId,
                currentWorkflowConnection.statusId
              );

            if (!nextWorkflowConnections?.length) {
              return;
            }

            const proposalSettingsDataSource =
              container.resolve<ProposalSettingsDataSource>(
                Tokens.ProposalSettingsDataSource
              );

            const workflowDataSource = container.resolve<WorkflowDataSource>(
              Tokens.WorkflowDataSource
            );

            const statusChangingEvents =
              await workflowDataSource.getStatusChangingEventsByConnectionIds(
                nextWorkflowConnections.map((connection) => connection.id),
                'proposal'
              );

            if (!statusChangingEvents) {
              return;
            }

            const eventThatTriggeredStatusChangeIsStatusChangingEvent =
              statusChangingEvents.find(
                (statusChangingEvent) =>
                  proposalWithEvents.currentEvent ===
                  statusChangingEvent.statusChangingEvent
              );

            if (!eventThatTriggeredStatusChangeIsStatusChangingEvent) {
              return;
            }

            if (
              shouldMoveToNextStatus(
                statusChangingEvents,
                proposalWithEvents.proposalEvents
              )
            ) {
              const updatedProposal =
                await proposalDataSource.updateProposalStatus(
                  proposalWithEvents.proposalPk,
                  currentWorkflowConnection.nextStatusId
                );

              if (updatedProposal) {
                await checkIfConditionsForNextStatusAreMet({
                  nextWorkflowConnections,
                  proposalWorkflow,
                  workflowDataSource,
                  proposalWithEvents,
                });

                return {
                  ...updatedProposal,
                  workflowId: proposalWorkflow.id,
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
  const filteredProposalsWithChangedStatuses =
    proposalsWithChangedStatuses.filter(
      (p): p is WorkflowEngineProposalType => !!p
    );

  // NOTE: Call the actions engine here
  if (filteredProposalsWithChangedStatuses.length) {
    statusActionEngine(filteredProposalsWithChangedStatuses);
  }

  return filteredProposalsWithChangedStatuses;
};

export const markProposalsEventAsDoneAndCallWorkflowEngine = async (
  eventType: Event,
  proposalPks: number[]
) => {
  if (eventType === Event.PROPOSAL_DELETED) {
    logger.logInfo(
      `${eventType} event triggered and workflow engine cannot continue because the referenced proposal/s are removed`,
      { proposalPks }
    );

    return;
  }

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const allProposalEvents = await proposalDataSource.markEventAsDoneOnProposals(
    eventType,
    proposalPks
  );

  const proposalPksWithEvents = proposalPks.map((proposalPk) => {
    return {
      proposalPk,
      proposalEvents: allProposalEvents?.find(
        (proposalEvents) => proposalEvents.proposal_pk === proposalPk
      ),
      currentEvent: eventType,
    };
  });

  const updatedProposals = await workflowEngine(proposalPksWithEvents);

  return updatedProposals;
};
