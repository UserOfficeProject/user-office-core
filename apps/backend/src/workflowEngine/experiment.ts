import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Event } from '../events/event.enum';
import { ExperimentSafety } from '../models/Experiment';
import { createWorkflowMachine } from './simpleStateMachine/createWorkflowMachine';
import { createActor } from './simpleStateMachine/stateMachnine';

type WorkflowStateMeta = { statusId: number; workflowStatusId: number };

export type WorkflowEngineExperimentType = ExperimentSafety & {
  prevWorkflowStatusId: number;
  workflowStatusConnectionId: number;
};

type WorkflowRunSingleInput = {
  experimentPk: number;
  currentEvent: Event;
};

type WorkflowRunBatchInput = {
  experimentPks: number[];
  event: Event;
};

export type WorkflowRunInput =
  | WorkflowRunSingleInput
  | WorkflowRunSingleInput[]
  | WorkflowRunBatchInput;

const isBatchWorkflowInput = (
  input: WorkflowRunInput
): input is WorkflowRunBatchInput => {
  return Array.isArray((input as WorkflowRunBatchInput).experimentPks);
};

@injectable()
export class ExperimentWorkflowEngine {
  constructor(
    @inject(Tokens.ExperimentDataSource)
    private readonly experimentDataSource: ExperimentDataSource,
    @inject(Tokens.ProposalDataSource)
    private readonly proposalDataSource: ProposalDataSource,
    @inject(Tokens.CallDataSource)
    private readonly callDataSource: CallDataSource
  ) {}

  async run(
    input: WorkflowRunInput
  ): Promise<Array<WorkflowEngineExperimentType>> {
    let normalizedInput: WorkflowRunSingleInput[];

    if (Array.isArray(input)) {
      normalizedInput = input;
    } else if (isBatchWorkflowInput(input)) {
      normalizedInput = input.experimentPks.map((experimentPk) => ({
        experimentPk,
        currentEvent: input.event,
      }));
    } else {
      normalizedInput = [input];
    }

    const experimentsWithChangedStatuses = await Promise.all(
      normalizedInput.map(({ experimentPk, currentEvent }) =>
        this.runOne(experimentPk, currentEvent)
      )
    );

    const validExperiments = experimentsWithChangedStatuses.filter(
      (p): p is WorkflowEngineExperimentType => !!p
    );

    return validExperiments;
  }

  /**
   * Internal method to run the workflow engine for a single experiment and event.
   */
  private async runOne(
    experimentPk: number,
    event: Event
  ): Promise<WorkflowEngineExperimentType | void> {
    const experiment =
      await this.experimentDataSource.getExperiment(experimentPk);

    if (!experiment) {
      logger.logError('Experiment not found', { experimentPk });

      return;
    }

    const proposal = await this.proposalDataSource.get(experiment.proposalPk);

    if (!proposal) {
      logger.logError('Proposal not found', {
        proposalPk: experiment.proposalPk,
      });

      return;
    }

    const experimentWorkflowId = (
      await this.callDataSource.getExperimentWorkflowByCall(proposal.callId)
    )?.id;

    if (!experimentWorkflowId) {
      logger.logError('Workflow not found for experiment', { experimentPk });

      return;
    }

    const experimentSafety =
      await this.experimentDataSource.getExperimentSafetyByExperimentPk(
        experimentPk
      );

    if (!experimentSafety) {
      return;
    }

    const currentWorkflowStatusId = experimentSafety.workflowStatusId;

    if (!currentWorkflowStatusId) {
      logger.logError('Experiment safety does not have a workflow status id', {
        experimentSafetyPk: experimentSafety.experimentSafetyPk,
      });

      return;
    }

    const machine = await createWorkflowMachine(experimentWorkflowId);

    const currentExperimentState = Object.entries(machine.schema.states).find(
      ([, state]) => {
        return (
          (state.meta as WorkflowStateMeta | undefined)?.workflowStatusId ===
          currentWorkflowStatusId
        );
      }
    )?.[0];

    const actor = createActor(
      machine,
      { id: experimentSafety.experimentSafetyPk },
      currentExperimentState
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
        const updatedExperimentSafety =
          await this.experimentDataSource.updateExperimentSafetyStatus(
            experimentSafety.experimentSafetyPk,
            nextWfStatusId
          );

        return {
          ...updatedExperimentSafety,
          prevWorkflowStatusId: currentWorkflowStatusId,
          workflowStatusConnectionId: connectionId,
        };
      }
    }
  }
}
