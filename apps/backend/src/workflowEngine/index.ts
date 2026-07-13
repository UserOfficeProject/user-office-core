import { injectable } from 'tsyringe';

import { WorkFlowEntity } from '../eventHandlers/workflowHandler';
import { Event } from '../events/event.enum';
import { createWorkflowMachine } from './stateMachine/createWorkflowMachine';
import { createActor } from './stateMachine/stateMachine';

type WorkflowStateMeta = { statusId: number; workflowStatusId: number };

export type WorkflowEngineType = {
  entityId: number;
  prevStatusId: number;
  nextStatusId: number;
  workflowStatusConnectionId: number;
};

type WorkflowRunSingleInput = {
  entity: number;
  currentEvent: Event;
};

type WorkflowRunBatchInput = {
  entities: number[];
  event: Event;
};

export type WorkflowRunInput =
  | WorkflowRunSingleInput
  | WorkflowRunSingleInput[]
  | WorkflowRunBatchInput;

const isBatchWorkflowInput = (
  input: WorkflowRunInput
): input is WorkflowRunBatchInput => {
  return Array.isArray((input as WorkflowRunBatchInput).entities);
};

@injectable()
export class WorkflowEngine {
  async run(
    input: WorkflowRunInput,
    workflowEntity: WorkFlowEntity
  ): Promise<Array<WorkflowEngineType>> {
    let normalizedInput: WorkflowRunSingleInput[];

    if (Array.isArray(input)) {
      normalizedInput = input;
    } else if (isBatchWorkflowInput(input)) {
      normalizedInput = input.entities.map((entity) => ({
        entity,
        currentEvent: input.event,
      }));
    } else {
      normalizedInput = [input];
    }
    const entitiesWithChangedStatuses = await Promise.all(
      normalizedInput.map(async ({ entity, currentEvent }) => {
        const workflowId = await workflowEntity.resolveWorkflowId(entity);
        if (!workflowId) {
          return;
        }
        const currentStatusId =
          await workflowEntity.resolveCurrentStatusId(entity);

        if (!currentStatusId) {
          return;
        }

        return await this.runOne(
          entity,
          workflowId,
          currentStatusId,
          currentEvent,
          async (newWorkflowStatusId: number) => {
            await workflowEntity.updateWorkflowStatus(
              entity,
              newWorkflowStatusId
            );
          }
        );
      })
    );

    const validEntities = entitiesWithChangedStatuses.filter(
      (p): p is WorkflowEngineType => !!p
    );

    return validEntities;
  }

  /**
   * Internal method to run the workflow engine for a single entity and event.
   */
  private async runOne(
    entityId: number,
    workflowId: number,
    currentStatusId: number,
    event: Event,
    handleEntityWorkflowChange: (newWorkflowStatus: number) => Promise<void>
  ): Promise<WorkflowEngineType | void> {
    const machine = await createWorkflowMachine(workflowId);
    const currentEntityState = Object.entries(machine.schema.states).find(
      ([, state]) => {
        return (
          (state.meta as WorkflowStateMeta | undefined)?.workflowStatusId ===
          currentStatusId
        );
      }
    )?.[0];

    const actor = createActor(machine, { id: entityId }, currentEntityState);
    const { nextStateValue, connectionId, transitionPerformed } =
      await actor.event(event.toUpperCase());
    if (transitionPerformed) {
      const meta = machine.schema.states[nextStateValue]?.meta as
        | WorkflowStateMeta
        | undefined;
      const nextWfStatusId = meta?.workflowStatusId;

      if (nextWfStatusId) {
        await handleEntityWorkflowChange(nextWfStatusId);

        return {
          entityId,
          prevStatusId: currentStatusId,
          nextStatusId: nextWfStatusId,
          workflowStatusConnectionId: connectionId,
        };
      }
    }
  }
}
