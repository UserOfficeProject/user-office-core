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
    description: string,
    connectionLineType: string
  ) => {
    return api({
      toastSuccessMessage: 'Workflow updated successfully!',
    })
      .updateWorkflow({
        id,
        name,
        description,
        connectionLineType,
      })
      .then((data) => data.updateWorkflow);
  };

  type MonitorableServiceCall = () => Promise<unknown>;

  const persistModel = ({
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

    const addConnectionToWorkflow = async (
      sourceWorkflowStatusId: number,
      targetWorkflowStatusId: number
    ) => {
      return api({
        toastSuccessMessage: 'Workflow connection added successfully!',
      })
        .addConnectionToWorkflow({
          newWorkflowConnectionInput: {
            prevWorkflowStatusId: sourceWorkflowStatusId,
            nextWorkflowStatusId: targetWorkflowStatusId,
          },
        })
        .then((data) => data.addConnectionToWorkflow);
    };

    const insertNewStatusInWorkflow = async (
      workflowId: number,
      statusId: number,
      posX: number,
      posY: number
    ) => {
      return api({ toastSuccessMessage: 'Workflow status added successfully' })
        .addStatusToWorkflow({
          workflowId,
          statusId,
          posY,
          posX,
        })
        .then((data) => data.addStatusToWorkflow);
    };

    const setStatusChangingEventsOnConnection = async (
      workflowConnectionId: number,
      statusChangingEvents: string[]
    ) => {
      return api({
        toastSuccessMessage: 'Status changing events set successfully!',
      })
        .setStatusChangingEventsOnConnection({
          workflowConnectionId,
          statusChangingEvents,
        })
        .then((data) => data.setStatusChangingEventsOnConnection);
    };

    const deleteWorkflowConnection = async (connectionId: number) => {
      return api({
        toastSuccessMessage: 'Workflow status removed successfully',
      })
        .deleteWorkflowConnection({
          connectionId,
        })
        .then((data) => data.deleteWorkflowConnection);
    };

    const deleteWorkflowStatus = async (workflowStatusId: number) => {
      return api({
        toastSuccessMessage: 'Workflow status removed successfully',
      })
        .deleteWorkflowStatus({
          workflowStatusId,
        })
        .then((data) => data.deleteWorkflowStatus);
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

      switch (action.type) {
        case EventType.UPDATE_WORKFLOW_METADATA_REQUESTED: {
          const { id, name, description, connectionLineType } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await updateWorkflowMetadata(
              id,
              name,
              description,
              connectionLineType
            );

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
          // Find the workflow connection to remove based on connectionId

          return executeAndMonitorCall(async () => {
            const result = await deleteWorkflowStatus(
              action.payload.workflowStatusId
            );

            dispatch({
              type: EventType.WORKFLOW_STATUS_DELETED,
              payload: action.payload,
            });

            return result;
          });

          break;
        case EventType.WORKFLOW_STATUS_UPDATE_REQUESTED: {
          const { id, posX, posY } = action.payload;

          return executeAndMonitorCall(async () => {
            try {
              const result = await api({
                toastErrorMessage: 'Failed to update workflow status',
              })
                .updateWorkflowStatus({
                  workflowStatusId: id,
                  posX,
                  posY,
                })
                .then((data) => data.updateWorkflowStatus);

              if (result) {
                // Dispatch the result to update the state
                dispatch({
                  type: EventType.WORKFLOW_STATUS_UPDATED,
                  payload: result,
                });
              }

              return result;
            } catch (error) {
              console.error('Failed to update workflow status:', error);
            }
          });

          break;
        }
        case EventType.ADD_WORKFLOW_STATUS_REQUESTED: {
          const { workflowId, statusId, posX, posY } = action.payload;

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
                statusId,
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

        case EventType.SET_STATUS_CHANGING_EVENTS_ON_CONNECTION_REQUESTED: {
          const { workflowConnection, statusChangingEvents } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await setStatusChangingEventsOnConnection(
              workflowConnection.id,
              statusChangingEvents
            );

            dispatch({
              type: EventType.STATUS_CHANGING_EVENTS_ON_CONNECTION_SET,
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
              type: EventType.STATUS_ACTIONS_UPDATED,
              payload: {
                workflowConnection: workflowConnection,
                statusActions: result,
              },
            });

            return result;
          });
        }
        case EventType.ADD_WORKFLOW_CONNECTION_REQUESTED: {
          const { sourceWorkflowStatusId, targetWorkflowStatusId } =
            action.payload;

          return executeAndMonitorCall(async () => {
            const result = await addConnectionToWorkflow(
              sourceWorkflowStatusId,
              targetWorkflowStatusId
            );

            dispatch({
              type: EventType.WORKFLOW_CONNECTION_ADDED,
              payload: result,
            });

            return result;
          });
        }
        case EventType.DELETE_WORKFLOW_CONNECTION_REQUESTED: {
          const { connectionId } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await deleteWorkflowConnection(connectionId);

            dispatch({
              type: EventType.WORKFLOW_CONNECTION_DELETED,
              payload: {
                connectionId,
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
