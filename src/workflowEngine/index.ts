import { proposalDataSource, proposalSettingsDataSource } from '../datasources';
import { ProposalEventsRecord } from '../datasources/postgres/records';
import { NextStatusEvent } from '../models/NextStatusEvent';

const getProposalWorkflowByCallId = (callId: number) => {
  return proposalSettingsDataSource.getProposalWorkflowByCall(callId);
};

const getProposalWorkflowConnectionByStatusId = (
  proposalWorkflowId: number,
  proposalStatusId: number
) => {
  return proposalSettingsDataSource.getProposalWorkflowConnection(
    proposalWorkflowId,
    proposalStatusId
  );
};

const shouldMoveToNextStatus = (
  nextStatusEvents: NextStatusEvent[],
  proposalEvents: ProposalEventsRecord
): boolean => {
  const proposalEventsKeys = Object.keys(proposalEvents);
  const allProposalIncompleteEvents = proposalEventsKeys.filter(
    (proposalEventsKey) =>
      !proposalEvents[proposalEventsKey as keyof ProposalEventsRecord]
  );

  const allNextStatusRulesFulfilled = !nextStatusEvents.some(
    (nextStatusEvent) =>
      allProposalIncompleteEvents.indexOf(
        nextStatusEvent.nextStatusEvent.toLowerCase()
      ) >= 0
  );

  return allNextStatusRulesFulfilled;
};

const updateProposalStatus = (
  proposalId: number,
  nextProposalStatusId: number
) => {
  return proposalDataSource.updateProposalStatus(
    proposalId,
    nextProposalStatusId
  );
};

export type WorkflowEngineProposalType = {
  id: number;
  callId: number;
  statusId: number;
};

export const workflowEngine = async (
  proposal: WorkflowEngineProposalType & {
    proposalEvents: ProposalEventsRecord | null;
    currentEvent: Event;
  }
) => {
  if (!proposal.proposalEvents) {
    return;
  }

  const proposalWorkflow = await getProposalWorkflowByCallId(proposal.callId);

  if (!proposalWorkflow) {
    return;
  }

  const currentWorkflowConnection = await getProposalWorkflowConnectionByStatusId(
    proposalWorkflow.id,
    proposal.statusId
  );

  if (
    !currentWorkflowConnection ||
    !currentWorkflowConnection.nextProposalStatusId
  ) {
    return;
  }

  const nextWorkflowConnection = await getProposalWorkflowConnectionByStatusId(
    proposalWorkflow.id,
    currentWorkflowConnection.nextProposalStatusId
  );

  const nextStatusEvents = await proposalSettingsDataSource.getNextStatusEventsByConnectionId(
    currentWorkflowConnection.id
  );

  if (!nextStatusEvents || !nextWorkflowConnection) {
    return;
  }

  const eventThatTriggeredStatusChangeIsNextStatusEvent = nextStatusEvents.find(
    (nextStatusEvent) =>
      proposal.currentEvent === nextStatusEvent.nextStatusEvent
  );

  if (!eventThatTriggeredStatusChangeIsNextStatusEvent) {
    return;
  }

  if (shouldMoveToNextStatus(nextStatusEvents, proposal.proposalEvents)) {
    await updateProposalStatus(
      proposal.id,
      nextWorkflowConnection.proposalStatusId
    );
  }
};
