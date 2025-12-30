import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';
import { createActor, createMachine } from 'xstate';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalEventsRecord } from '../datasources/postgres/records';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { proposalStatusActionEngine } from '../statusActionEngine/proposal';

const getProposalWorkflowByCallId = (callId: number) => {
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  return callDataSource.getProposalWorkflowByCall(callId);
};

type StateNodeConfig = {
  on: Record<string, { target: string }>;
  meta?: { statusId: number };
};

const createProposalMachine = async (
  workflowId: number,
  currentStatusId: number
) => {
  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  const { workflowStatuses, workflowConnections } =
    await workflowDataSource.getWorkflowStructure(workflowId);

  const states: Record<string, StateNodeConfig> = {};

  // Map workflowStatusId to shortCode for easy lookup
  const statusIdToShortCodeMap = new Map<number, string>();

  workflowStatuses.forEach((ws) => {
    statusIdToShortCodeMap.set(ws.workflowStatusId, ws.shortCode);
    states[ws.shortCode] = {
      on: {},
      meta: {
        statusId: ws.statusId,
      },
    };
  });

  workflowConnections.forEach((conn) => {
    const sourceState = statusIdToShortCodeMap.get(conn.prevWorkflowStatusId);
    const targetState = statusIdToShortCodeMap.get(conn.nextWorkflowStatusId);
    // Events are stored as strings in the DB, ensuring they match the Event enum format (usually uppercase)
    const event = conn.statusChangingEvent.toUpperCase();

    if (sourceState && targetState && event) {
      states[sourceState].on[event] = {
        target: targetState,
      };
    }
  });

  const currentShortCode = statusIdToShortCodeMap.get(currentStatusId);

  return createMachine({
    id: `proposal-workflow-${workflowId}`,
    initial: currentShortCode || 'DRAFT',
    states,
  });
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
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  const proposalsWithChangedStatuses = await Promise.all(
    args.map(async (arg) => {
      const proposal = await proposalDataSource.get(arg.proposalPk);

      if (!proposal) {
        logger.logError('Proposal not found', { proposalPk: arg.proposalPk });

        return;
      }

      const proposalWorkflow = await getProposalWorkflowByCallId(
        proposal.callId
      );

      if (!proposalWorkflow) {
        return;
      }

      const machine = await createProposalMachine(
        proposalWorkflow.id,
        proposal.statusId
      );

      const actor = createActor(machine).start();
      const snapshot = actor.getSnapshot();
      const currentShortCode = snapshot.value;

      actor.send({ type: arg.currentEvent.toUpperCase() });

      const nextStateValue = actor.getSnapshot().value;

      if (
        typeof nextStateValue === 'string' &&
        nextStateValue !== currentShortCode
      ) {
        const nextStatusId = machine.states[nextStateValue].meta?.statusId;

        if (nextStatusId) {
          const updatedProposal = await proposalDataSource.updateProposalStatus(
            arg.proposalPk,
            nextStatusId
          );

          const call = await callDataSource.getCall(proposal.callId);

          return {
            ...updatedProposal,
            workflowId: proposalWorkflow.id,
            prevStatusId: proposal.statusId,
            callShortCode: call?.shortCode || '',
          };
        }
      }
    })
  );

  const validProposals = proposalsWithChangedStatuses.filter(
    (p): p is WorkflowEngineProposalType => !!p
  );

  if (validProposals.length > 0) {
    await proposalStatusActionEngine(validProposals);
  }

  return validProposals;
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
