/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  WORKFLOW_STATUS_UPDATED,
  DELETE_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_DELETED,
  UPDATE_WORKFLOW_METADATA_REQUESTED,
  WORKFLOW_METADATA_UPDATED,
  ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS,
  NEXT_STATUS_EVENTS_ADDED,
  ADD_NEXT_STATUS_EVENTS_REQUESTED,
  ADD_STATUS_ACTION_REQUESTED,
  STATUS_ACTION_ADDED,
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
    entityType: entityType, // NOTE: This is hardcoded for now
  };

  function reducer(state: Workflow, action: Event): Workflow {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED: {
          // For ReactFlow, we don't need to add to workflowConnections here
          // The actual visual representation is handled by ReactFlow nodes/edges
          return draft;
        }
        case EventType.WORKFLOW_STATUS_UPDATED: {
          // For ReactFlow, we don't need to update workflowConnections here
          return draft;
        }
        case EventType.WORKFLOW_STATUS_DELETED:
          // For ReactFlow, we don't use the old group system
          return draft;
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.NEXT_STATUS_EVENTS_ADDED: {
          // For ReactFlow, we don't use the old group system
          return draft;
        }
        case EventType.STATUS_ACTION_ADDED: {
          // For ReactFlow, we don't use the old group system
          return draft;
        }
        case EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS: {
          // For ReactFlow, we don't use the old group system
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
