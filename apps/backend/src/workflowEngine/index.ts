import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import CallDataSource from '../datasources/postgres/CallDataSource';
import ProposalDataSource from '../datasources/postgres/ProposalDataSource';
import ProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import { ProposalEventsRecord } from '../datasources/postgres/records';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { statusActionEngine } from '../statusActionEngine';

const proposalSettingsDataSource = container.resolve(
  ProposalSettingsDataSource
);
const proposalDataSource = container.resolve(ProposalDataSource);
const callDataSource = container.resolve(CallDataSource);

const getProposalWorkflowByCallId = (callId: number) => {
  return proposalSettingsDataSource.getProposalWorkflowByCall(callId);
};

export const getProposalWorkflowConnectionByStatusId = (
  proposalWorkflowId: number,
  proposalStatusId: number,
  prevProposalStatusId?: number
) => {
  return proposalSettingsDataSource.getProposalWorkflowConnectionsById(
    proposalWorkflowId,
    proposalStatusId,
    { prevProposalStatusId }
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

const updateProposalStatus = (
  proposalPk: number,
  nextProposalStatusId: number
) => proposalDataSource.updateProposalStatus(proposalPk, nextProposalStatusId);

export type WorkflowEngineProposalType = Proposal & {
  workflowId: number;
  prevProposalStatusId: number;
  callShortCode: string;
};

export const workflowEngine = async (
  args: {
    proposalPk: number;
    proposalEvents?: ProposalEventsRecord;
    currentEvent: Event;
  }[]
): Promise<Array<WorkflowEngineProposalType | void> | void> => {
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

        const call = await callDataSource.getCall(proposal.callId);

        if (!call) {
          return;
        }

        /**
         * NOTE: We can have more than one current connection because of the multi-column workflows.
         * This is the way how we store the connection that has multiple next connections.
         * We have multiple separate connection records pointing to each next connection.
         * For example if we have status: FEASIBILITY_REVIEW which has multiple next statuses like: FAP_SELECTION and NOT_FEASIBLE.
         * We store one record of FEASIBILITY_REVIEW with nextProposalStatusId = FAP_SELECTION and another one with nextProposalStatusId = NOT_FEASIBLE.
         * We go through each record and based on the currentEvent we move the proposal into the right direction
         */
        return Promise.all(
          currentWorkflowConnections.map(async (currentWorkflowConnection) => {
            if (!currentWorkflowConnection.nextProposalStatusId) {
              return;
            }

            if (!proposalWithEvents.proposalEvents) {
              return;
            }

            const nextWorkflowConnections =
              await getProposalWorkflowConnectionByStatusId(
                proposalWorkflow.id,
                currentWorkflowConnection.nextProposalStatusId,
                currentWorkflowConnection.proposalStatusId
              );

            if (!nextWorkflowConnections?.length) {
              return;
            }

            const statusChangingEvents =
              await proposalSettingsDataSource.getStatusChangingEventsByConnectionIds(
                nextWorkflowConnections.map((connection) => connection.id)
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
              const updatedProposal = await updateProposalStatus(
                proposalWithEvents.proposalPk,
                currentWorkflowConnection.nextProposalStatusId
              );

              if (updatedProposal) {
                return {
                  ...updatedProposal,
                  workflowId: proposalWorkflow.id,
                  prevProposalStatusId:
                    currentWorkflowConnection.proposalStatusId,
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
