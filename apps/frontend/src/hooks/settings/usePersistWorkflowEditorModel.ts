import { useState } from 'react';

import {
  Event,
  EventType,
} from 'components/settings/workflow/WorkflowEditorModel';
import {
  ConnectionHasActionsInput,
  WorkflowConnection,
  Workflow,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export function usePersistWorkflowEditorModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { api } = useDataApiWithFeedback();

  const updateWorkflowMetadata = async (
    id: number,
    name: string,
    description: string
  ) => {
    return api({
      toastSuccessMessage: 'Workflow updated successfully!',
    })
      .updateWorkflow({
        id,
        name,
        description,
      })
      .then((data) => data.updateWorkflow);
  };

  type MonitorableServiceCall = () => Promise<unknown>;

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<Workflow, Event>) => {
    const executeAndMonitorCall = (call: MonitorableServiceCall) => {
      setIsLoading(true);
      call()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    };

    const insertNewStatusInWorkflow = async (
      workflowId: number,
      sortOrder: number,
      statusId: number,
      nextStatusId: number,
      prevStatusId: number,
      posX: number,
      posY: number
    ) => {
      return api({ toastSuccessMessage: 'Workflow status added successfully' })
        .addWorkflowStatus({
          workflowId,
          sortOrder,
          statusId,
          nextStatusId,
          prevStatusId,
          posY,
          posX,
        })
        .then((data) => data.addWorkflowStatus);
    };

    const deleteWorkflowStatus = async (
      statusId: number,
      workflowId: number,
      sortOrder: number
    ) => {
      return api({
        toastSuccessMessage: 'Workflow status removed successfully',
      })
        .deleteWorkflowStatus({
          statusId,
          workflowId,
          sortOrder,
        })
        .then((data) => data.deleteWorkflowStatus);
    };

    const addStatusChangingEventsToConnection = async (
      workflowConnectionId: number,
      statusChangingEvents: string[]
    ) => {
      return api({
        toastSuccessMessage: 'Status changing events added successfully!',
      })
        .addStatusChangingEventsToConnection({
          workflowConnectionId,
          statusChangingEvents,
        })
        .then((data) => data.addStatusChangingEventsToConnection);
    };

    const addStatusActionToConnection = async (
      statusActions: ConnectionHasActionsInput[],
      workflowConnection: WorkflowConnection
    ) => {
      return api({
        toastSuccessMessage: `Status actions ${
          statusActions.length ? 'added' : 'removed'
        } successfully!`,
      })
        .addConnectionStatusActions({
          actions: statusActions,
          workflowId: workflowConnection.workflowId,
          connectionId: workflowConnection.id,
        })
        .then((data) => data.addConnectionStatusActions);
    };

    return (next: FunctionType) => (action: Event) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case EventType.UPDATE_WORKFLOW_METADATA_REQUESTED: {
          const { id, name, description } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await updateWorkflowMetadata(id, name, description);

            if (result) {
              dispatch({
                type: EventType.WORKFLOW_METADATA_UPDATED,
                payload: action.payload,
              });
            }

            return result;
          });
        }
        case EventType.DELETE_WORKFLOW_STATUS_REQUESTED:
          // Find the workflow connection to remove based on statusId
          const workflowConnectionToRemove = state.workflowConnections.find(
            (connection) => connection.statusId === action.payload.statusId
          );

          if (workflowConnectionToRemove) {
            return executeAndMonitorCall(async () => {
              const result = await deleteWorkflowStatus(
                workflowConnectionToRemove.statusId,
                workflowConnectionToRemove.workflowId,
                workflowConnectionToRemove.sortOrder
              );

              dispatch({
                type: EventType.WORKFLOW_STATUS_DELETED,
                payload: action.payload,
              });

              return result;
            });
          }

          break;
        case EventType.WORKFLOW_STATUS_UPDATE_REQUESTED: {
          const { statusId, posX, posY, prevStatusId, nextStatusId } =
            action.payload;

          // Find the workflow connection to update (target connection)
          const workflowConnectionToUpdate = state.workflowConnections.find(
            (connection) => connection.statusId === parseInt(statusId)
          );

          if (workflowConnectionToUpdate) {
            return executeAndMonitorCall(async () => {
              try {
                const result = await api({
                  toastErrorMessage: 'Failed to update workflow status',
                })
                  .updateWorkflowStatus({
                    id: workflowConnectionToUpdate.id,
                    posX,
                    posY,
                    prevStatusId,
                    nextStatusId,
                  })
                  .then((data) => data.updateWorkflowStatus);

                if (result) {
                  // Dispatch the result to update the state
                  dispatch({
                    type: EventType.WORKFLOW_STATUS_UPDATED,
                    payload: result,
                  });
                }

                const workflowConnectionsWithSameStatusId =
                  state.workflowConnections.filter(
                    (connection) => connection.statusId === parseInt(statusId)
                  );

                // Update all connections with the same statusId to the same posX and posY
                // This is necessary because of existing data structure where the same status can have multiple rows in the db
                workflowConnectionsWithSameStatusId.forEach((connection) => {
                  dispatch({
                    type: EventType.WORKFLOW_STATUS_UPDATED,
                    payload: {
                      id: connection.id,
                      posX: result.posX,
                      posY: result.posY,
                    },
                  });
                });

                return result;
              } catch (error) {
                console.error('Failed to update workflow status:', error);
              }
            });
          }

          break;
        }
        case EventType.ADD_WORKFLOW_STATUS_REQUESTED: {
          const {
            workflowId,
            sortOrder,
            statusId,
            nextStatusId,
            prevStatusId,
            posX,
            posY,
          } = action.payload;

          // Immediately add to state so it shows up in the UI
          dispatch({
            type: EventType.WORKFLOW_STATUS_ADDED,
            payload: {
              ...action.payload,
            },
          });

          return executeAndMonitorCall(async () => {
            try {
              const result = await insertNewStatusInWorkflow(
                workflowId,
                sortOrder,
                statusId,
                nextStatusId,
                prevStatusId,
                posX,
                posY
              );

              // Update the connection with the real ID from the API
              dispatch({
                type: EventType.WORKFLOW_STATUS_UPDATED,
                payload: { ...action.payload, ...result },
              });

              return result;
            } catch (error) {
              // Remove from state if API call failed
              dispatch({
                type: EventType.WORKFLOW_STATUS_DELETED,
                payload: { ...action.payload },
              });
              throw error;
            }
          });
        }

        case EventType.ADD_NEXT_STATUS_EVENTS_REQUESTED: {
          const { workflowConnection, statusChangingEvents } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await addStatusChangingEventsToConnection(
              workflowConnection.id,
              statusChangingEvents
            );

            dispatch({
              type: EventType.NEXT_STATUS_EVENTS_ADDED,
              payload: {
                workflowConnection,
                statusChangingEvents: result,
              },
            });

            return result;
          });
        }
        case EventType.ADD_STATUS_ACTION_REQUESTED: {
          const { workflowConnection, statusActions } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await addStatusActionToConnection(
              statusActions,
              workflowConnection
            );

            dispatch({
              type: EventType.STATUS_ACTION_ADDED,
              payload: {
                workflowConnection: workflowConnection,
                statusActions: result,
              },
            });

            return result;
          });
        }
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
