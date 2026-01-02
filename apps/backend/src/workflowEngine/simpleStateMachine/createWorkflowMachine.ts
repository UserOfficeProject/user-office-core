import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { StatusDataSource } from '../../datasources/StatusDataSource';
import { WorkflowDataSource } from '../../datasources/WorkflowDataSource';
import { Event, EventMetadataByEvent } from '../../events/event.enum';
import { createMachine, GuardFn, StateConfig } from './stateMachnine';

const workflowMachineCache = new Map<
  number,
  ReturnType<typeof createMachine>
>();

const createWfStatusName = (shortCode: string, workflowStatusId: number) =>
  `${shortCode}-${workflowStatusId}`;

const getEventGuard = (eventName: string): GuardFn | undefined => {
  const eventMeta = EventMetadataByEvent.get(eventName as Event);

  return eventMeta?.guard;
};

export const createWorkflowMachine = async (workflowId: number) => {
  const cachedMachine = workflowMachineCache.get(workflowId);
  if (cachedMachine) {
    return cachedMachine;
  }

  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  const statusDataSource = container.resolve<StatusDataSource>(
    Tokens.StatusDataSource
  );

  const { workflowStatuses, workflowConnections } =
    await workflowDataSource.getWorkflowStructure(workflowId);

  const wfStatuses: Record<string, StateConfig> = {};

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
      const guard = getEventGuard(event);
      wfStatuses[sourceStatus].on = wfStatuses[sourceStatus].on || {};
      wfStatuses[sourceStatus].on![event] = {
        target: targetStatus,
        guard,
      };
    }
  });

  const defaultWfStatus =
    (await statusDataSource.getDefaultWorkflowStatus(workflowId))!;

  const machine = createMachine({
    id: `workflow-${workflowId}`,
    initial: wfStatusIdToNameMap.get(defaultWfStatus.workflowStatusId)!,
    states: wfStatuses,
  });

  workflowMachineCache.set(workflowId, machine);

  return machine;
};
