import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { WorkflowDataSource } from '../../datasources/WorkflowDataSource';
import { Event, EventMetadataByEvent } from '../../events/event.enum';
import { createMachine, GuardFn, StateConfig } from './stateMachnine';

const workflowMachineCache = new Map<
  number,
  ReturnType<typeof createMachine>
>();

const createWfStatusName = (statusId: string, workflowStatusId: number) =>
  `${statusId}-${workflowStatusId}`;

const getEventsGuards = (events: string[]): GuardFn[] => {
  const guards: GuardFn[] = [];

  events.forEach((eventName) => {
    const event = Event[eventName as keyof typeof Event];
    if (!event) {
      return;
    }

    const eventMetadata = EventMetadataByEvent.get(event);
    if (eventMetadata?.guard) {
      guards.push(eventMetadata.guard);
    }
  });

  return guards;
};

export const createWorkflowMachine = async (workflowId: number) => {
  const cachedMachine = workflowMachineCache.get(workflowId);
  if (cachedMachine) {
    return cachedMachine;
  }

  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  const { workflowStatuses, workflowConnections } =
    await workflowDataSource.getWorkflowStructure(workflowId);

  const wfStatuses: Record<string, StateConfig> = {};
  const wfStatusIdToNameMap = new Map<number, string>(); // Map workflowStatusId to statusId for easy lookup

  workflowStatuses.forEach((ws) => {
    const wfStatusName = createWfStatusName(ws.statusId, ws.workflowStatusId);
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

    if (!sourceStatus || !targetStatus) {
      return;
    }

    conn.statusChangingEvents.forEach((eventName) => {
      const event = eventName.toUpperCase();

      if (!event) {
        return;
      }

      const guards = getEventsGuards(conn.statusChangingEvents);
      wfStatuses[sourceStatus].on = wfStatuses[sourceStatus].on || {};
      wfStatuses[sourceStatus].on![event] = {
        connectionId: conn.workflowStatusConnectionId,
        target: targetStatus,
        guards,
      };
    });
  });

  const defaultWfStatus =
    (await workflowDataSource.getDefaultWorkflowStatus(workflowId))!;

  const machine = createMachine({
    id: `workflow-${workflowId}`,
    initial: wfStatusIdToNameMap.get(defaultWfStatus.workflowStatusId)!,
    states: wfStatuses,
  });

  workflowMachineCache.set(workflowId, machine); // TODO enable cache after testing

  return machine;
};
