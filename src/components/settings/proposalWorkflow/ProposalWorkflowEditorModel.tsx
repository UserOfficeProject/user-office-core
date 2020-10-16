import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import {
  ProposalWorkflow,
  ProposalWorkflowConnection,
  ProposalWorkflowConnectionGroup,
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
  DELETE_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_DELETED,
  REORDER_WORKFLOW_STATUS_REQUESTED,
  REORDER_WORKFLOW_STATUS_FAILED,
  SERVICE_ERROR_OCCURRED,
  UPDATE_WORKFLOW_METADATA_REQUESTED,
  WORKFLOW_METADATA_UPDATED,
  ADD_NEW_ROW_WITH_MULTIPLE_COLLUMNS,
  ADD_NEXT_STATUS_EVENTS,
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
    proposalWorkflowConnectionGroups: [],
  };

  const findGroupIndexByGroupId = (
    workflowConnectionGroups: ProposalWorkflowConnectionGroup[],
    groupId: string
  ) =>
    workflowConnectionGroups.findIndex(
      workflowConnectionGroup => workflowConnectionGroup.groupId === groupId
    );

  const findGroupAndAddNewStatusConnection = (
    workflowConnectionGroups: ProposalWorkflowConnectionGroup[],
    newConnection: ProposalWorkflowConnection
  ) => {
    const groupIndexWhereStatusShouldBeAdded = findGroupIndexByGroupId(
      workflowConnectionGroups,
      newConnection.droppableGroupId
    );

    workflowConnectionGroups[
      groupIndexWhereStatusShouldBeAdded
    ].connections.splice(newConnection.sortOrder, 0, newConnection);

    return workflowConnectionGroups;
  };

  const moveStatusConnectionInsideWorkflow = (
    workflowConnectionGroups: ProposalWorkflowConnectionGroup[],
    from: { droppableId: string; index: number },
    to: { droppableId: string; index: number }
  ) => {
    const sourceWorkflowConnectionsGroupIndex = findGroupIndexByGroupId(
      workflowConnectionGroups,
      from.droppableId
    );

    const destinationWorkflowConnectionGroupIndex =
      from.droppableId === to.droppableId
        ? sourceWorkflowConnectionsGroupIndex
        : findGroupIndexByGroupId(workflowConnectionGroups, to.droppableId);
    const proposalWorkflowConnectionToMove =
      workflowConnectionGroups[sourceWorkflowConnectionsGroupIndex]
        ?.connections[from.index];

    workflowConnectionGroups[
      sourceWorkflowConnectionsGroupIndex
    ]?.connections.splice(from.index, 1);

    proposalWorkflowConnectionToMove.droppableGroupId =
      workflowConnectionGroups[destinationWorkflowConnectionGroupIndex].groupId;

    workflowConnectionGroups[
      destinationWorkflowConnectionGroupIndex
    ]?.connections.splice(
      to.index,
      0,
      proposalWorkflowConnectionToMove as ProposalWorkflowConnection
    );

    return workflowConnectionGroups;
  };

  function reducer(state: ProposalWorkflow, action: Event): ProposalWorkflow {
    return produce(state, draft => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED:
          const { proposalWorkflowConnectionGroups } = draft;
          const newConnectionToAdd = action.payload;

          draft.proposalWorkflowConnectionGroups = findGroupAndAddNewStatusConnection(
            proposalWorkflowConnectionGroups,
            newConnectionToAdd
          );

          return draft;
        case EventType.REORDER_WORKFLOW_STATUS_REQUESTED:
          const { source, destination } = action.payload;

          draft.proposalWorkflowConnectionGroups = moveStatusConnectionInsideWorkflow(
            draft.proposalWorkflowConnectionGroups,
            source,
            destination
          );

          return draft;
        case EventType.REORDER_WORKFLOW_STATUS_FAILED:
          //   draft.proposalWorkflowConnectionGroups = moveArrayElement(
          //     draft.proposalWorkflowConnectionGroups,
          //     action.payload.source.index,
          //     action.payload.destination.index
          //   );

          return draft;
        case EventType.WORKFLOW_STATUS_DELETED:
          const removingGroupIndex = findGroupIndexByGroupId(
            draft.proposalWorkflowConnectionGroups,
            action.payload.source.droppableId
          );

          draft.proposalWorkflowConnectionGroups[
            removingGroupIndex
          ].connections.splice(action.payload.source.index, 1);

          return draft;
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.ADD_NEXT_STATUS_EVENTS: {
          return draft;
        }
        case EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLLUMNS: {
          const groupsToAdd: ProposalWorkflowConnectionGroup[] = [];
          const lastGroupId = parseInt(
            draft.proposalWorkflowConnectionGroups[
              draft.proposalWorkflowConnectionGroups.length - 1
            ].groupId.split('_')[1]
          );

          for (let index = 0; index < action.payload.numberOfColumns; index++) {
            groupsToAdd.push({
              groupId: `proposalWorkflowConnections_${lastGroupId + index + 1}`,
              parentGroupId: action.payload.parentDroppableId,
              connections: [],
            });
          }

          draft.proposalWorkflowConnectionGroups.push(...groupsToAdd);

          return draft;
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
        // NOTE: Push at least one group to have initial droppable if new proposal workflow
        if (
          data.proposalWorkflow?.proposalWorkflowConnectionGroups.length === 0
        ) {
          data.proposalWorkflow.proposalWorkflowConnectionGroups.push({
            groupId: 'proposalWorkflowConnections_0',
            parentGroupId: null,
            connections: [],
          });
        }
        memoizedDispatch({
          type: EventType.READY,
          payload: data.proposalWorkflow,
        });
      });
  }, [api, memoizedDispatch, workflowId]);

  return { state, dispatch };
};

export default ProposalWorkflowEditorModel;
