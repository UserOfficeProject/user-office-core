import { container } from 'tsyringe';

import ProposalDataSource from '../datasources/postgres/ProposalDataSource';
import ProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import { ProposalEventsRecord } from '../datasources/postgres/records';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { StatusChangingEvent } from '../models/StatusChangingEvent';

const proposalSettingsDataSource = container.resolve(
  ProposalSettingsDataSource
);
const proposalDataSource = container.resolve(ProposalDataSource);

const getProposalWorkflowByCallId = (callId: number) => {
  return proposalSettingsDataSource.getProposalWorkflowByCall(callId);
};

const getProposalWorkflowConnectionByStatusId = (
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

export type WorkflowEngineProposalType = {
  primaryKey: number;
  callId: number;
  statusId: number;
};

export const workflowEngine = async (
  proposal: WorkflowEngineProposalType & {
    proposalEvents: ProposalEventsRecord | null;
    currentEvent: Event;
  }
): Promise<Array<Proposal | void> | void> => {
  const proposalWorkflow = await getProposalWorkflowByCallId(proposal.callId);

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

  /**
   * NOTE: We can have more than one current connection because of the multi-column workflows.
   * This is the way how we store the connection that has multiple next connections.
   * We have multiple separate connection records pointing to each next connection.
   * For example if we have status: FEASIBILITY_REVIEW which has multiple next statuses like: SEP_SELECTION and NOT_FEASIBLE.
   * We store one record of FEASIBILITY_REVIEW with nextProposalStatusId = SEP_SELECTION and another one with nextProposalStatusId = NOT_FEASIBLE.
   * We go through each record and based on the currentEvent we move the proposal into the right direction
   */
  return Promise.all(
    currentWorkflowConnections.map(async (currentWorkflowConnection) => {
      if (!currentWorkflowConnection.nextProposalStatusId) {
        return;
      }

      if (!proposal.proposalEvents) {
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
            proposal.currentEvent === statusChangingEvent.statusChangingEvent
        );

      if (!eventThatTriggeredStatusChangeIsStatusChangingEvent) {
        return;
      }

      if (
        shouldMoveToNextStatus(statusChangingEvents, proposal.proposalEvents)
      ) {
        return updateProposalStatus(
          proposal.primaryKey,
          currentWorkflowConnection.nextProposalStatusId
        );
      }
    })
  );
};
