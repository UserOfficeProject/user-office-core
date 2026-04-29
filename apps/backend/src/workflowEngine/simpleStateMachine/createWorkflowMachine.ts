import { container } from 'tsyringe';

import { createMachine, GuardFn, StateConfig } from './stateMachnine';
import { Tokens } from '../../config/Tokens';
import { WorkflowDataSource } from '../../datasources/WorkflowDataSource';
import { Event, EventMetadataByEvent } from '../../events/event.enum';

const createWorkFlowStatusName = (statusId: string, workflowStatusId: number) =>
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
  const workflowDataSource = container.resolve<WorkflowDataSource>(
    Tokens.WorkflowDataSource
  );

  const { workflowStatuses, workflowConnections } =
    await workflowDataSource.getWorkflowStructure(workflowId);

  const workFlowStates: Record<string, StateConfig> = {};
  const workFlowStatusIdToNameMap = new Map<number, string>(); // Map workflowStatusId to statusId for easy lookup

  workflowStatuses.forEach((ws) => {
    const workFlowStatusName = createWorkFlowStatusName(
      ws.statusId,
      ws.workflowStatusId
    );
    workFlowStatusIdToNameMap.set(ws.workflowStatusId, workFlowStatusName);
    workFlowStates[workFlowStatusName] = {
      on: {},
      meta: {
        workflowStatusId: ws.workflowStatusId,
        statusId: ws.statusId,
      },
    };
  });

  workflowConnections.forEach((conn) => {
    const sourceStatus = workFlowStatusIdToNameMap.get(
      conn.prevWorkflowStatusId
    );
    const targetStatus = workFlowStatusIdToNameMap.get(
      conn.nextWorkflowStatusId
    );

    if (!sourceStatus || !targetStatus) {
      return;
    }

    conn.statusChangingEvents.forEach((eventName) => {
      const event = eventName.toUpperCase();

      if (!event) {
        return;
      }

      const guards = getEventsGuards(conn.statusChangingEvents);
      workFlowStates[sourceStatus].on = workFlowStates[sourceStatus].on || {};
      workFlowStates[sourceStatus].on![event] = {
        connectionId: conn.workflowStatusConnectionId,
        target: targetStatus,
        guards,
      };
    });
  });

  const defaultWorkFlowStatus =
    (await workflowDataSource.getInitialWorkflowStatus(workflowId))!;

  const machine = createMachine({
    id: `workflow-${workflowId}`,
    initial: workFlowStatusIdToNameMap.get(
      defaultWorkFlowStatus.workflowStatusId
    )!,
    states: workFlowStates,
  });

  return machine;
};
