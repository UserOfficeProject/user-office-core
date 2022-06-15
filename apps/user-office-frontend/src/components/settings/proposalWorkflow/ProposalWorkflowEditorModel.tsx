/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import {
  StatusChangingEvent,
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
  WORKFLOW_STATUS_UPDATED,
  DELETE_WORKFLOW_STATUS_REQUESTED,
  WORKFLOW_STATUS_DELETED,
  REORDER_WORKFLOW_STATUS_REQUESTED,
  REORDER_WORKFLOW_STATUS_FAILED,
  SERVICE_ERROR_OCCURRED,
  UPDATE_WORKFLOW_METADATA_REQUESTED,
  WORKFLOW_METADATA_UPDATED,
  ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS,
  NEXT_STATUS_EVENTS_ADDED,
  ADD_NEXT_STATUS_EVENTS_REQUESTED,
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
      (workflowConnectionGroup) => workflowConnectionGroup.groupId === groupId
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

    const previousConnectionInTheGroup =
      workflowConnectionGroups[groupIndexWhereStatusShouldBeAdded].connections[
        newConnection.sortOrder - 1
      ];

    if (previousConnectionInTheGroup) {
      previousConnectionInTheGroup.nextProposalStatusId =
        newConnection.proposalStatusId;
    }

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

  const addStatusChangingEventsToConnection = (
    workflowConnectionGroups: ProposalWorkflowConnectionGroup[],
    workflowConnection: ProposalWorkflowConnection,
    statusChangingEvents: StatusChangingEvent[]
  ) => {
    const groupIndexWhereConnectionShouldBeUpdated = findGroupIndexByGroupId(
      workflowConnectionGroups,
      workflowConnection.droppableGroupId
    );

    const connectionToUpdate = workflowConnectionGroups[
      groupIndexWhereConnectionShouldBeUpdated
    ].connections.find((connection) => connection.id === workflowConnection.id);

    if (connectionToUpdate) {
      connectionToUpdate.statusChangingEvents = statusChangingEvents;
    }

    return workflowConnectionGroups;
  };

  function reducer(state: ProposalWorkflow, action: Event): ProposalWorkflow {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED: {
          const { proposalWorkflowConnectionGroups } = draft;
          const newConnectionToAdd = action.payload;

          draft.proposalWorkflowConnectionGroups =
            findGroupAndAddNewStatusConnection(
              proposalWorkflowConnectionGroups,
              newConnectionToAdd
            );

          return draft;
        }
        case EventType.WORKFLOW_STATUS_UPDATED: {
          const { proposalWorkflowConnectionGroups } = draft;
          const connectionToUpdate = action.payload;

          const groupIndexWhereStatusShouldBeAdded = findGroupIndexByGroupId(
            proposalWorkflowConnectionGroups,
            connectionToUpdate.droppableGroupId
          );

          proposalWorkflowConnectionGroups[
            groupIndexWhereStatusShouldBeAdded
          ].connections[action.payload.sortOrder].id = action.payload.id;

          return draft;
        }
        case EventType.REORDER_WORKFLOW_STATUS_REQUESTED:
          const { source, destination } = action.payload;

          draft.proposalWorkflowConnectionGroups =
            moveStatusConnectionInsideWorkflow(
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

          const removingGroupConnections =
            draft.proposalWorkflowConnectionGroups[removingGroupIndex]
              .connections;

          const previousConnection =
            removingGroupConnections[action.payload.source.index - 1];
          if (previousConnection) {
            previousConnection.nextProposalStatusId =
              removingGroupConnections[
                action.payload.source.index
              ].nextProposalStatusId;
          }

          removingGroupConnections.splice(action.payload.source.index, 1);

          return draft;
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.NEXT_STATUS_EVENTS_ADDED: {
          const { proposalWorkflowConnectionGroups } = draft;
          const { workflowConnection, statusChangingEvents } = action.payload;

          draft.proposalWorkflowConnectionGroups =
            addStatusChangingEventsToConnection(
              proposalWorkflowConnectionGroups,
              workflowConnection,
              statusChangingEvents
            );

          return draft;
        }
        case EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS: {
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

  // NOTE: required to avoid infinite re-render because dispatch function is recreated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedDispatch = useCallback(dispatch, []);
  const api = useDataApi();

  useEffect(() => {
    api()
      .getProposalWorkflow({ id: parseInt(workflowId) })
      .then((data) => {
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
