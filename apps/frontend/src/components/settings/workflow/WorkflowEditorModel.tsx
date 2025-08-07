/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ConnectionLineType } from 'reactflow';

import { Workflow, WorkflowType } from 'generated/sdk';
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
  NEXT_STATUS_EVENTS_ADDED,
  ADD_NEXT_STATUS_EVENTS_REQUESTED,
  ADD_STATUS_ACTION_REQUESTED,
  STATUS_ACTION_ADDED,
  DELETE_WORKFLOW_CONNECTION_REQUESTED,
  WORKFLOW_CONNECTION_DELETED,
}

export interface Event {
  type: EventType;
  payload: any;
}

const WorkflowEditorModel = (
  entityType: WorkflowType,
  middlewares?: Array<ReducerMiddleware<Workflow, Event>>
) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const blankInitTemplate: Workflow = {
    id: 0,
    name: '',
    description: '',
    workflowConnections: [],
    connectionLineType: ConnectionLineType.Bezier,
    entityType: entityType,
  };

  function reducer(state: Workflow, action: Event): Workflow {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED: {
          // Add the new workflow connection to the state
          if (
            action.payload &&
            action.payload.statusId &&
            action.payload.status
          ) {
            const newConnection = {
              id: action.payload.id || 0, // Will be updated when API response comes back
              workflowId: action.payload.workflowId,
              statusId: action.payload.statusId,
              status: action.payload.status,
              sortOrder: action.payload.sortOrder,
              prevStatusId: action.payload.prevStatusId,
              nextStatusId: action.payload.nextStatusId,
              posX: action.payload.posX,
              posY: action.payload.posY,
              prevConnectionId: action.payload.prevConnectionId || null,
              statusChangingEvents: [],
              statusActions: [],
            };
            draft.workflowConnections.push(newConnection);
          }

          return draft;
        }
        case EventType.WORKFLOW_STATUS_UPDATED: {
          // If payload contains an updated connection (from middleware response), update state
          if (action.payload && action.payload.id) {
            const updatedConnection = action.payload;
            const connectionIndex = draft.workflowConnections.findIndex(
              (conn) =>
                conn.id === updatedConnection.id ||
                (conn.id === 0 && conn.statusId === updatedConnection.statusId)
            );
            if (connectionIndex !== -1) {
              draft.workflowConnections[connectionIndex] = {
                ...draft.workflowConnections[connectionIndex],
                ...updatedConnection,
              };
            }
          }
          // Otherwise, this is just a request that will be handled by middleware

          return draft;
        }
        case EventType.WORKFLOW_STATUS_DELETED: {
          // Remove the workflow connection by statusId
          if (action.payload && action.payload.statusId) {
            draft.workflowConnections = draft.workflowConnections.filter(
              (conn) => conn.statusId !== action.payload.statusId
            );
          }

          return draft;
        }
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.NEXT_STATUS_EVENTS_ADDED: {
          const { workflowConnection, statusChangingEvents } = action.payload;
          const connectionIndex = draft.workflowConnections.findIndex(
            (conn) => conn.id === workflowConnection.id
          );
          if (connectionIndex !== -1) {
            draft.workflowConnections[connectionIndex].statusChangingEvents =
              statusChangingEvents;
          }

          return draft;
        }
        case EventType.STATUS_ACTION_ADDED: {
          return { ...draft, ...action.payload };
        }
        case EventType.WORKFLOW_CONNECTION_DELETED: {
          // Remove the workflow connection by connectionId
          if (action.payload && action.payload.connectionId) {
            draft.workflowConnections = draft.workflowConnections.filter(
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
      })
      .then((data) => {
        memoizedDispatch({
          type: EventType.READY,
          payload: data.workflow,
        });
      });
  }, [api, memoizedDispatch, workflowId, entityType]);

  return { state, dispatch };
};

export default WorkflowEditorModel;
