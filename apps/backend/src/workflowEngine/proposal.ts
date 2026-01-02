import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { proposalStatusActionEngine } from '../statusActionEngine/proposal';
import { createWorkflowMachine } from './simpleStateMachine/createWorkflowMachine';
import { createActor } from './simpleStateMachine/stateMachnine';

type WorkflowStateMeta = { statusId: number; workflowStatusId: number };

export type WorkflowEngineProposalType = Proposal & {
  prevStatusId: number;
  workflowStatusConnectionId: number;
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

      const proposalWorkflowId = (
        await callDataSource.getProposalWorkflowByCall(proposal.callId)
      )?.id;

      if (!proposalWorkflowId) {
        logger.logError('Proposal workflow not found for the proposal', {
          proposalPk: arg.proposalPk,
          callId: proposal.callId,
        });

        return;
      }

      const machine = await createWorkflowMachine(proposalWorkflowId);

      const proposalWfStatus = Object.entries(machine.schema.states).find(
        ([, state]) => {
          return (
            (state.meta as WorkflowStateMeta | undefined)?.workflowStatusId ===
            proposal.workflowStatusId
          );
        }
      )?.[0];

      const actor = createActor(
        machine,
        { id: proposal.primaryKey },
        proposalWfStatus
      );
      const currentWfStatus = actor.getState();

      const { nextStateValue, connectionId } = await actor.event(
        arg.currentEvent.toUpperCase()
      );

      if (nextStateValue !== currentWfStatus) {
        const meta = machine.schema.states[nextStateValue]?.meta as
          | WorkflowStateMeta
          | undefined;
        const nextWfStatusId = meta?.workflowStatusId;

        if (nextWfStatusId) {
          const updatedProposal =
            await proposalDataSource.updateProposalWfStatus(
              arg.proposalPk,
              nextWfStatusId
            );

          return {
            ...updatedProposal,
            workflowStatusConnectionId: connectionId,
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
