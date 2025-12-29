/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ConnectionLineType } from 'reactflow';

import {
  ConnectionHasActionsInput,
  ConnectionStatusAction,
  Status,
  StatusChangingEvent,
  Workflow,
  WorkflowConnection,
  WorkflowStatus,
  WorkflowType,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import {
  useReducerWithMiddleWares,
  ReducerMiddleware,
} from 'utils/useReducerWithMiddleWares';

export enum EventType {
  READY,
  ADD_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_ADDED,
  WORKFLOW_STATUS_UPDATE_REQUESTED,
  WORKFLOW_STATUS_UPDATED,
  DELETE_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_DELETED,
  UPDATE_WORKFLOW_METADATA_REQUESTED,
  WORKFLOW_METADATA_UPDATED,
  STATUS_CHANGING_EVENTS_ON_CONNECTION_SET,
  SET_STATUS_CHANGING_EVENTS_ON_CONNECTION_REQUESTED,
  ADD_STATUS_ACTION_REQUESTED,
  STATUS_ACTIONS_UPDATED,
  ADD_WORKFLOW_CONNECTION_REQUESTED,
  WORKFLOW_CONNECTION_ADDED,
  DELETE_WORKFLOW_CONNECTION_REQUESTED,
  WORKFLOW_CONNECTION_DELETED,
}

export type Event =
  | { type: EventType.READY; payload: Workflow }
  | {
      type: EventType.ADD_WORKFLOW_STATUS_REQUESTED;
      payload: {
        workflowId: number;
        posX: number;
        posY: number;
        status: Status;
      };
    }
  | {
      type: EventType.WORKFLOW_STATUS_ADDED;
      payload: {
        workflowStatusId: number;
        workflowId: number;
        status: Status;
        posX: number;
        posY: number;
      };
    }
  | {
      type: EventType.WORKFLOW_STATUS_UPDATE_REQUESTED;
      payload: { workflowStatusId: number; posX: number; posY: number };
    }
  | {
      type: EventType.WORKFLOW_STATUS_UPDATED;
      payload: Partial<WorkflowStatus> & { workflowStatusId: number };
    }
  | {
      type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED;
      payload: { workflowStatusId: number };
    }
  | {
      type: EventType.WORKFLOW_STATUS_DELETED;
      payload: { workflowStatusId: number };
    }
  | {
      type: EventType.UPDATE_WORKFLOW_METADATA_REQUESTED;
      payload: {
        id: number;
        name: string;
        description: string;
        connectionLineType: string;
      };
    }
  | {
      type: EventType.WORKFLOW_METADATA_UPDATED;
      payload: {
        id: number;
        name: string;
        description: string;
        connectionLineType: string;
      };
    }
  | {
      type: EventType.STATUS_CHANGING_EVENTS_ON_CONNECTION_SET;
      payload: {
        workflowConnection: WorkflowConnection;
        statusChangingEvents: StatusChangingEvent[];
      };
    }
  | {
      type: EventType.SET_STATUS_CHANGING_EVENTS_ON_CONNECTION_REQUESTED;
      payload: {
        workflowConnection: WorkflowConnection;
        statusChangingEvents: string[];
      };
    }
  | {
      type: EventType.ADD_STATUS_ACTION_REQUESTED;
      payload: {
        workflowConnection: WorkflowConnection;
        statusActions: ConnectionHasActionsInput[];
      };
    }
  | {
      type: EventType.STATUS_ACTIONS_UPDATED;
      payload: {
        workflowConnection: WorkflowConnection;
        statusActions: ConnectionStatusAction[];
      };
    }
  | {
      type: EventType.ADD_WORKFLOW_CONNECTION_REQUESTED;
      payload: {
        sourceWorkflowStatusId: number;
        targetWorkflowStatusId: number;
      };
    }
  | {
      type: EventType.WORKFLOW_CONNECTION_ADDED;
      payload: Partial<WorkflowConnection>;
    }
  | {
      type: EventType.DELETE_WORKFLOW_CONNECTION_REQUESTED;
      payload: { connectionId: number };
    }
  | {
      type: EventType.WORKFLOW_CONNECTION_DELETED;
      payload: { connectionId: number };
    };

const WorkflowEditorModel = (
  entityType: WorkflowType,
  middlewares?: Array<ReducerMiddleware<Workflow, Event>>
) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const blankInitTemplate: Workflow = {
    id: 0,
    name: '',
    description: '',
    connections: [],
    statuses: [],
    connectionLineType: ConnectionLineType.Bezier,
    entityType: entityType,
  };

  function reducer(state: Workflow, action: Event): Workflow {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED: {
          // Add the new workflow status to the state
          if (action.payload && action.payload.status) {
            const newWorkflowStatus: WorkflowStatus = {
              workflowStatusId: action.payload.workflowStatusId,
              workflowId: action.payload.workflowId,
              statusId: action.payload.status.id,
              status: action.payload.status,
              posX: action.payload.posX,
              posY: action.payload.posY,
            };
            draft.statuses.push(newWorkflowStatus);
          }

          return draft;
        }
        case EventType.WORKFLOW_STATUS_UPDATED: {
          // If payload contains an updated status (from middleware response), update state
          if (action.payload && action.payload.workflowStatusId) {
            const updatedStatus = action.payload;
            const statusIndex = draft.statuses.findIndex(
              (status) =>
                status.workflowStatusId === updatedStatus.workflowStatusId
            );
            if (statusIndex !== -1) {
              draft.statuses[statusIndex] = {
                ...draft.statuses[statusIndex],
                ...updatedStatus,
              };
            }
          }
          // Otherwise, this is just a request that will be handled by middleware

          return draft;
        }
        case EventType.WORKFLOW_STATUS_DELETED: {
          // Remove the workflow status by statusId
          if (action.payload.workflowStatusId) {
            draft.statuses = draft.statuses.filter(
              (status) =>
                status.workflowStatusId !== action.payload.workflowStatusId
            );
          }

          return draft;
        }
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.STATUS_CHANGING_EVENTS_ON_CONNECTION_SET: {
          const { workflowConnection, statusChangingEvents } = action.payload;
          const connectionIndex = draft.connections.findIndex(
            (conn) => conn.id === workflowConnection.id
          );
          if (connectionIndex !== -1) {
            draft.connections[connectionIndex].statusChangingEvents =
              statusChangingEvents;
          }

          return draft;
        }
        case EventType.STATUS_ACTIONS_UPDATED: {
          const { workflowConnection, statusActions } = action.payload;
          const connectionIndex = draft.connections.findIndex(
            (conn) => conn.id === workflowConnection.id
          );
          if (connectionIndex !== -1) {
            draft.connections[connectionIndex].statusActions = statusActions;
          }

          return draft;
        }
        case EventType.ADD_WORKFLOW_CONNECTION_REQUESTED: {
          const { sourceWorkflowStatusId, targetWorkflowStatusId } =
            action.payload;

          const prevStatus = draft.statuses.find(
            (status) => status.workflowStatusId === sourceWorkflowStatusId
          )!;
          const nextStatus = draft.statuses.find(
            (status) => status.workflowStatusId === targetWorkflowStatusId
          )!;

          draft.connections.push({
            id: 0, // Temporary ID, will be updated when API response comes back
            workflowId: draft.id,
            prevWorkflowStatusId: sourceWorkflowStatusId,
            nextWorkflowStatusId: targetWorkflowStatusId,
            prevStatus,
            nextStatus,
            statusChangingEvents: [],
            statusActions: [],
          });

          return draft;
        }
        case EventType.WORKFLOW_CONNECTION_ADDED: {
          // Update the connection with the real ID from the API
          const connectionIndex = draft.connections.findIndex(
            (conn) =>
              conn.prevWorkflowStatusId ===
                action.payload.prevWorkflowStatusId &&
              conn.nextWorkflowStatusId === action.payload.nextWorkflowStatusId
          );
          if (
            connectionIndex !== -1 &&
            draft.connections[connectionIndex].id === 0
          ) {
            draft.connections[connectionIndex] = {
              ...draft.connections[connectionIndex],
              ...action.payload,
            };
          }

          return draft;
        }
        case EventType.WORKFLOW_CONNECTION_DELETED: {
          // Remove the workflow connection by connectionId
          if (action.payload && action.payload.connectionId) {
            draft.connections = draft.connections.filter(
              (conn) => conn.id !== action.payload.connectionId
            );
          }

          return draft;
        }
      }
    });
  }

  const [state, dispatch] = useReducerWithMiddleWares<Reducer<Workflow, Event>>(
    reducer,
    blankInitTemplate,
    middlewares || []
  );

  // NOTE: required to avoid infinite re-render because dispatch function is recreated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedDispatch = useCallback(dispatch, []);
  const api = useDataApi();

  useEffect(() => {
    if (!workflowId) {
      return;
    }

    api()
      .getWorkflow({
        workflowId: parseInt(workflowId),
        entityType: entityType,
      })
      .then((data) => {
        if (data.workflow) {
          memoizedDispatch({
            type: EventType.READY,
            payload: { ...data.workflow, entityType },
          });
        }
      });
  }, [api, memoizedDispatch, workflowId, entityType]);

  return { state, dispatch };
};

export default WorkflowEditorModel;
