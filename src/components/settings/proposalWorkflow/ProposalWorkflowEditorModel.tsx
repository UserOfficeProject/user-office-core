import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import { ProposalWorkflow, ProposalWorkflowConnection } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import {
  useReducerWithMiddleWares,
  ReducerMiddleware,
} from 'utils/useReducerWithMiddleWares';

export enum EventType {
  READY,
  ADD_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_ADDED,
  DELETE_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_DELETED,
  REORDER_WORKFLOW_STATUS_REQUESTED,
  REORDER_WORKFLOW_STATUS_FAILED,
  SERVICE_ERROR_OCCURRED,
  UPDATE_WORKFLOW_METADATA_REQUESTED,
  WORKFLOW_METADATA_UPDATED,
}

export interface Event {
  type: EventType;
  payload: any;
}

const ProposalWorkflowEditorModel = (
  middlewares?: Array<ReducerMiddleware<ProposalWorkflow, Event>>
) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const blankInitTemplate: ProposalWorkflow = {
    id: 0,
    name: '',
    description: '',
    proposalWorkflowConnections: [],
  };

  const moveArrayElement = (
    workflowConnections: ProposalWorkflowConnection[],
    fromIndex: number,
    toIndex: number
  ) => {
    const proposalWorkflowConnectionToMove = workflowConnections[fromIndex];

    workflowConnections.splice(fromIndex, 1);

    workflowConnections.splice(toIndex, 0, proposalWorkflowConnectionToMove);

    return workflowConnections;
  };

  function reducer(state: ProposalWorkflow, action: Event): ProposalWorkflow {
    return produce(state, draft => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED:
          draft.proposalWorkflowConnections.splice(
            action.payload.sortOrder,
            0,
            action.payload
          );

          return draft;
        case EventType.REORDER_WORKFLOW_STATUS_REQUESTED:
          draft.proposalWorkflowConnections = moveArrayElement(
            draft.proposalWorkflowConnections,
            action.payload.source.index,
            action.payload.destination.index
          );

          return draft;
        case EventType.REORDER_WORKFLOW_STATUS_FAILED:
          draft.proposalWorkflowConnections = moveArrayElement(
            draft.proposalWorkflowConnections,
            action.payload.source.index,
            action.payload.destination.index
          );

          return draft;
        case EventType.WORKFLOW_STATUS_DELETED:
          draft.proposalWorkflowConnections.splice(
            action.payload.source.index,
            1
          );

          return draft;
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
      }
    });
  }

  const [state, dispatch] = useReducerWithMiddleWares<
    Reducer<ProposalWorkflow, Event>
  >(reducer, blankInitTemplate, middlewares || []);
  const memoizedDispatch = useCallback(dispatch, []); // required to avoid infinite re-render because dispatch function is recreated
  const api = useDataApi();

  useEffect(() => {
    api()
      .getProposalWorkflow({ id: parseInt(workflowId) })
      .then(data => {
        memoizedDispatch({
          type: EventType.READY,
          payload: data.proposalWorkflow,
        });
      });
  }, [api, memoizedDispatch, workflowId]);

  return { state, dispatch };
};

export default ProposalWorkflowEditorModel;
