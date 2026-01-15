import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

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

type WorkflowRunSingleInput = {
  proposalPk: number;
  currentEvent: Event;
};

type WorkflowRunBatchInput = {
  proposalPks: number[];
  event: Event;
};

export type WorkflowRunInput =
  | WorkflowRunSingleInput
  | WorkflowRunSingleInput[]
  | WorkflowRunBatchInput;

const isBatchWorkflowInput = (
  input: WorkflowRunInput
): input is WorkflowRunBatchInput => {
  return Array.isArray((input as WorkflowRunBatchInput).proposalPks);
};

@injectable()
export class ProposalWorkflowEngine {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private readonly proposalDataSource: ProposalDataSource,
    @inject(Tokens.CallDataSource)
    private readonly callDataSource: CallDataSource
  ) {}

  async run(
    input: WorkflowRunInput
  ): Promise<Array<WorkflowEngineProposalType | void> | void> {
    let normalizedInput: WorkflowRunSingleInput[];

    if (Array.isArray(input)) {
      normalizedInput = input;
    } else if (isBatchWorkflowInput(input)) {
      normalizedInput = input.proposalPks.map((proposalPk) => ({
        proposalPk,
        currentEvent: input.event,
      }));
    } else {
      normalizedInput = [input];
    }

    const proposalsWithChangedStatuses = await Promise.all(
      normalizedInput.map(({ proposalPk, currentEvent }) =>
        this.runInternal(proposalPk, currentEvent)
      )
    );

    const validProposals = proposalsWithChangedStatuses.filter(
      (p): p is WorkflowEngineProposalType => !!p
    );

    if (validProposals.length > 0) {
      await proposalStatusActionEngine(validProposals);
    }

    return validProposals;
  }

  private async runInternal(
    proposalPk: number,
    event: Event
  ): Promise<WorkflowEngineProposalType | void> {
    if (event === Event.PROPOSAL_DELETED) {
      return;
    }

    const proposal = await this.proposalDataSource.get(proposalPk);

    if (!proposal) {
      logger.logError('Proposal not found', { proposalPk });

      return;
    }

    const proposalWorkflowId = (
      await this.callDataSource.getProposalWorkflowByCall(proposal.callId)
    )?.id;

    if (!proposalWorkflowId) {
      logger.logError('Workflow not found for proposal', { proposalPk });

      return;
    }

    const machine = await createWorkflowMachine(proposalWorkflowId);

    const currentProposalState = Object.entries(machine.schema.states).find(
      ([, state]) => {
        return (
          (state.meta as WorkflowStateMeta | undefined)?.workflowStatusId ===
          proposal.workflowStatusId
        );
      }
    )?.[0]; // find the state matching proposalWorkflowStatusId in the state machine

    const actor = createActor(
      machine,
      { id: proposal.primaryKey },
      currentProposalState
    );
    const currentWfStatus = actor.getState();

    const { nextStateValue, connectionId } = await actor.event(
      event.toUpperCase()
    );

    if (nextStateValue !== currentWfStatus) {
      const meta = machine.schema.states[nextStateValue]?.meta as
        | WorkflowStateMeta
        | undefined;
      const nextWfStatusId = meta?.workflowStatusId;

      if (nextWfStatusId) {
        const updatedProposal =
          await this.proposalDataSource.updateProposalWfStatus(
            proposalPk,
            nextWfStatusId
          );

        return {
          ...updatedProposal,
          prevStatusId: proposal.workflowStatusId,
          workflowStatusConnectionId: connectionId,
        };
      }
    }
  }
}
