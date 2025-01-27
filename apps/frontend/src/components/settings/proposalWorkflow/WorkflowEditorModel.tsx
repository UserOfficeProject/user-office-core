/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  StatusChangingEvent,
  WorkflowConnection,
  ConnectionStatusAction,
  Workflow,
  WorkflowConnectionGroup,
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
  middlewares?: Array<ReducerMiddleware<Workflow, Event>>
) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const blankInitTemplate: Workflow = {
    id: 0,
    name: '',
    description: '',
    workflowConnectionGroups: [],
    entityType: 'proposal', // NOTE: This is hardcoded for now
  };

  const findGroupIndexByGroupId = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
    groupId: string
  ) =>
    workflowConnectionGroups.findIndex(
      (workflowConnectionGroup) => workflowConnectionGroup.groupId === groupId
    );

  const findGroupAndAddNewStatusConnection = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
    newConnection: WorkflowConnection
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
      previousConnectionInTheGroup.nextStatusId = newConnection.statusId;
    }

    return workflowConnectionGroups;
  };

  const moveStatusConnectionInsideWorkflow = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
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
    const workflowConnectionToMove =
      workflowConnectionGroups[sourceWorkflowConnectionsGroupIndex]
        ?.connections[from.index];

    workflowConnectionGroups[
      sourceWorkflowConnectionsGroupIndex
    ]?.connections.splice(from.index, 1);

    workflowConnectionToMove.droppableGroupId =
      workflowConnectionGroups[destinationWorkflowConnectionGroupIndex].groupId;

    workflowConnectionGroups[
      destinationWorkflowConnectionGroupIndex
    ]?.connections.splice(
      to.index,
      0,
      workflowConnectionToMove as WorkflowConnection
    );

    return workflowConnectionGroups;
  };

  const addStatusChangingEventsToConnection = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
    workflowConnection: WorkflowConnection,
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

  const addStatusActionsToConnection = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
    workflowConnection: WorkflowConnection,
    statusActions: ConnectionStatusAction[]
  ) => {
    const groupIndexWhereConnectionShouldBeUpdated = findGroupIndexByGroupId(
      workflowConnectionGroups,
      workflowConnection.droppableGroupId
    );

    const connectionToUpdate = workflowConnectionGroups[
      groupIndexWhereConnectionShouldBeUpdated
    ].connections.find((connection) => connection.id === workflowConnection.id);

    if (connectionToUpdate) {
      connectionToUpdate.statusActions = statusActions;
    }

    return workflowConnectionGroups;
  };

  function reducer(state: Workflow, action: Event): Workflow {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.WORKFLOW_STATUS_ADDED: {
          const { workflowConnectionGroups } = draft;
          const newConnectionToAdd = action.payload;

          draft.workflowConnectionGroups = findGroupAndAddNewStatusConnection(
            workflowConnectionGroups,
            newConnectionToAdd
          );

          return draft;
        }
        case EventType.WORKFLOW_STATUS_UPDATED: {
          const { workflowConnectionGroups } = draft;
          const connectionToUpdate = action.payload;

          const groupIndexWhereStatusShouldBeAdded = findGroupIndexByGroupId(
            workflowConnectionGroups,
            connectionToUpdate.droppableGroupId
          );

          workflowConnectionGroups[
            groupIndexWhereStatusShouldBeAdded
          ].connections[action.payload.sortOrder].id = action.payload.id;

          return draft;
        }
        case EventType.REORDER_WORKFLOW_STATUS_REQUESTED:
          const { source, destination } = action.payload;

          draft.workflowConnectionGroups = moveStatusConnectionInsideWorkflow(
            draft.workflowConnectionGroups,
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
            draft.workflowConnectionGroups,
            action.payload.source.droppableId
          );

          const removingGroupConnections =
            draft.workflowConnectionGroups[removingGroupIndex].connections;

          const previousConnection =
            removingGroupConnections[action.payload.source.index - 1];
          if (previousConnection) {
            previousConnection.nextStatusId =
              removingGroupConnections[
                action.payload.source.index
              ].nextStatusId;
          }

          removingGroupConnections.splice(action.payload.source.index, 1);

          return draft;
        case EventType.WORKFLOW_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
        case EventType.NEXT_STATUS_EVENTS_ADDED: {
          const { workflowConnectionGroups } = draft;
          const { workflowConnection, statusChangingEvents } = action.payload;

          draft.workflowConnectionGroups = addStatusChangingEventsToConnection(
            workflowConnectionGroups,
            workflowConnection,
            statusChangingEvents
          );

          return draft;
        }
        case EventType.STATUS_ACTION_ADDED: {
          const { workflowConnectionGroups } = draft;
          const { workflowConnection, statusActions } = action.payload;

          draft.workflowConnectionGroups = addStatusActionsToConnection(
            workflowConnectionGroups,
            workflowConnection,
            statusActions
          );

          return draft;
        }
        case EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS: {
          const groupsToAdd: WorkflowConnectionGroup[] = [];
          const lastGroupId = parseInt(
            draft.workflowConnectionGroups[
              draft.workflowConnectionGroups.length - 1
            ].groupId.split('_')[1]
          );

          for (let index = 0; index < action.payload.numberOfColumns; index++) {
            groupsToAdd.push({
              groupId: `proposalWorkflowConnections_${lastGroupId + index + 1}`,
              parentGroupId: action.payload.parentDroppableId,
              connections: [],
            });
          }

          draft.workflowConnectionGroups.push(...groupsToAdd);

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
        entityType: 'proposal', // NOTE: This is hardcoded for now
      })
      .then((data) => {
        // NOTE: Push at least one group to have initial droppable if new proposal workflow
        if (data.workflow?.workflowConnectionGroups.length === 0) {
          data.workflow.workflowConnectionGroups.push({
            groupId: 'proposalWorkflowConnections_0',
            parentGroupId: null,
            connections: [],
          });
        }
        memoizedDispatch({
          type: EventType.READY,
          payload: data.workflow,
        });
      });
  }, [api, memoizedDispatch, workflowId]);

  return { state, dispatch };
};

export default WorkflowEditorModel;
