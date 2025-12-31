import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';
import { and, createActor, createMachine } from 'xstate';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { proposalStatusActionEngine } from '../statusActionEngine/proposal';
import { IsProposalSubmittedGuard } from './guards/IsProposalSubmittedGuard';

const getProposalWorkflowByCallId = (callId: number) => {
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  return callDataSource.getProposalWorkflowByCall(callId);
};

const createWfStatusName = (shortCode: string, workflowStatusId: number) =>
  `${shortCode}-${workflowStatusId}`;

type StatusNodeConfig = {
  on: Record<string, any>;
  meta?: { statusId: number; workflowStatusId: number };
};

const createProposalMachine = async (
  workflowId: number,
  proposal: Pick<Proposal, 'workflowStatusId' | 'primaryKey'>
) => {
  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  const { workflowStatuses, workflowConnections } =
    await workflowDataSource.getWorkflowStructure(workflowId);

  const draftWfStatus = workflowStatuses.find(
    (ws) => ws.shortCode === 'DRAFT'
  )!;
  const draftWfStatusName = createWfStatusName(
    draftWfStatus.shortCode,
    draftWfStatus.workflowStatusId
  );

  const wfStatuses: Record<string, StatusNodeConfig> = {};

  // Map workflowStatusId to shortCode for easy lookup
  const wfStatusIdToNameMap = new Map<number, string>();

  workflowStatuses.forEach((ws) => {
    const wfStatusName = createWfStatusName(ws.shortCode, ws.workflowStatusId);
    wfStatusIdToNameMap.set(ws.workflowStatusId, wfStatusName);
    wfStatuses[wfStatusName] = {
      on: {},
      meta: {
        workflowStatusId: ws.workflowStatusId,
        statusId: ws.statusId,
      },
    };
  });

  workflowConnections.forEach((conn) => {
    const sourceStatus = wfStatusIdToNameMap.get(conn.prevWorkflowStatusId);
    const targetStatus = wfStatusIdToNameMap.get(conn.nextWorkflowStatusId);
    // Events are stored as strings in the DB, ensuring they match the Event enum format (usually uppercase)
    const event = conn.statusChangingEvent.toUpperCase();

    if (sourceStatus && targetStatus && event) {
      const guards = conn.guardNames.map((guardName) => ({ type: guardName }));
      wfStatuses[sourceStatus].on[event] = {
        target: targetStatus,
        guard: guards.length > 0 ? and(guards) : undefined,
      };
    }
  });

  const currentWfStatusName = wfStatusIdToNameMap.get(
    proposal.workflowStatusId
  );

  const isProposalSubmittedGuard = new IsProposalSubmittedGuard();
  await isProposalSubmittedGuard.initialize(proposal.primaryKey);

  return createMachine(
    {
      id: `proposal-workflow-${workflowId}`,
      initial: currentWfStatusName || draftWfStatusName,
      states: wfStatuses,
    },
    {
      guards: {
        isProposalSubmittedGuard: () => isProposalSubmittedGuard.guard(),
      },
    }
  );
};

export type WorkflowEngineProposalType = Proposal & {
  workflowId: number;
  prevStatusId: number;
  callShortCode: string;
};

export const workflowEngine = async (
  args: {
    proposalPk: number;
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
        proposal
      );

      const actor = createActor(machine).start();
      const snapshot = actor.getSnapshot();
      const currentWfStatus = snapshot.value;

      actor.send({ type: arg.currentEvent.toUpperCase() });

      const nextStateValue = actor.getSnapshot().value as string;

      if (nextStateValue !== currentWfStatus) {
        const meta = machine.states[nextStateValue].meta;
        const nextWfStatusId = meta?.workflowStatusId;

        if (nextWfStatusId) {
          const updatedProposal =
            await proposalDataSource.updateProposalWfStatus(
              arg.proposalPk,
              nextWfStatusId
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

export const callWorkflowEngine = async (
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

  const proposalPksWithEvents = proposalPks.map((proposalPk) => {
    return {
      proposalPk,
      currentEvent: eventType,
    };
  });

  const updatedProposals = await workflowEngine(proposalPksWithEvents);

  return updatedProposals;
};
