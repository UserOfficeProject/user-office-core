import { useState } from 'react';

import {
  Event,
  EventType,
} from 'components/settings/proposalWorkflow/ProposalWorkflowEditorModel';
import {
  ConnectionHasActionsInput,
  IndexWithGroupId,
  ProposalWorkflow,
  ProposalWorkflowConnection,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export function usePersistProposalWorkflowEditorModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { api } = useDataApiWithFeedback();

  const updateProposalWorkflowMetadata = async (
    id: number,
    name: string,
    description: string
  ) => {
    return api({
      toastSuccessMessage: 'Proposal workflow updated successfully!',
    })
      .updateProposalWorkflow({
        id,
        name,
        description,
      })
      .then((data) => data.updateProposalWorkflow);
  };

  type MonitorableServiceCall = () => Promise<unknown>;

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<ProposalWorkflow, Event>) => {
    const executeAndMonitorCall = (call: MonitorableServiceCall) => {
      setIsLoading(true);
      call().then(() => {
        setIsLoading(false);
      });
    };

    const insertNewStatusInProposalWorkflow = async (
      proposalWorkflowId: number,
      sortOrder: number,
      droppableGroupId: string,
      parentDroppableGroupId: string,
      proposalStatusId: number,
      nextProposalStatusId: number,
      prevProposalStatusId: number
    ) => {
      return api({ toastSuccessMessage: 'Workflow status added successfully' })
        .addProposalWorkflowStatus({
          proposalWorkflowId,
          sortOrder,
          droppableGroupId,
          parentDroppableGroupId,
          proposalStatusId,
          nextProposalStatusId,
          prevProposalStatusId,
        })
        .then((data) => data.addProposalWorkflowStatus);
    };

    const reorderStatusesInProposalWorkflow = async (
      from: IndexWithGroupId,
      to: IndexWithGroupId,
      proposalWorkflowId: number
    ) => {
      return api({
        toastSuccessMessage: 'Workflow statuses reordered successfully',
      })
        .moveProposalWorkflowStatus({
          from,
          to,
          proposalWorkflowId,
        })
        .then((data) => data.moveProposalWorkflowStatus);
    };

    const deleteProposalWorkflowStatus = async (
      proposalStatusId: number,
      proposalWorkflowId: number,
      sortOrder: number
    ) => {
      return api({
        toastSuccessMessage: 'Workflow status removed successfully',
      })
        .deleteProposalWorkflowStatus({
          proposalStatusId,
          proposalWorkflowId,
          sortOrder,
        })
        .then((data) => data.deleteProposalWorkflowStatus);
    };

    const addStatusChangingEventsToConnection = async (
      proposalWorkflowConnectionId: number,
      statusChangingEvents: string[]
    ) => {
      return api({
        toastSuccessMessage: 'Status changing events added successfully!',
      })
        .addStatusChangingEventsToConnection({
          proposalWorkflowConnectionId,
          statusChangingEvents,
        })
        .then((data) => data.addStatusChangingEventsToConnection);
    };

    const addStatusActionToConnection = async (
      statusActions: ConnectionHasActionsInput[],
      workflowConnection: ProposalWorkflowConnection
    ) => {
      console.log('statusActions', statusActions, workflowConnection);

      return api({
        toastSuccessMessage: 'Status actions added successfully!',
      })
        .addConnectionStatusActions({
          actions: statusActions,
          workflowId: workflowConnection.proposalWorkflowId,
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
            const result = await updateProposalWorkflowMetadata(
              id,
              name,
              description
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
        case EventType.REORDER_WORKFLOW_STATUS_REQUESTED:
          const { source, destination } = action.payload;

          return executeAndMonitorCall(async () => {
            try {
              const result = await reorderStatusesInProposalWorkflow(
                source,
                destination,
                state.id
              );

              return result;
            } catch (error) {
              dispatch({
                type: EventType.REORDER_WORKFLOW_STATUS_FAILED,
                payload: {
                  source: destination,
                  destination: source,
                },
              });
            }
          });
        case EventType.DELETE_WORKFLOW_STATUS_REQUESTED:
          dispatch({
            type: EventType.WORKFLOW_STATUS_DELETED,
            payload: action.payload,
          });

          const groupToRemoveFrom = state.proposalWorkflowConnectionGroups.find(
            (proposalWorkflowConnectionGroup) =>
              proposalWorkflowConnectionGroup.groupId ===
              action.payload.source.droppableId
          );
          const proposalWorkflowConnectionToRemove =
            groupToRemoveFrom?.connections[action.payload.source.index];

          if (proposalWorkflowConnectionToRemove) {
            return executeAndMonitorCall(async () => {
              try {
                const result = await deleteProposalWorkflowStatus(
                  proposalWorkflowConnectionToRemove.proposalStatusId,
                  proposalWorkflowConnectionToRemove.proposalWorkflowId,
                  proposalWorkflowConnectionToRemove.sortOrder
                );

                return result;
              } catch (error) {
                dispatch({
                  type: EventType.WORKFLOW_STATUS_ADDED,
                  payload: {
                    ...proposalWorkflowConnectionToRemove,
                    source: action.payload.source,
                  },
                });
              }
            });
          }

          break;
        case EventType.ADD_WORKFLOW_STATUS_REQUESTED: {
          const {
            proposalWorkflowId,
            sortOrder,
            proposalStatusId,
            nextProposalStatusId,
            prevProposalStatusId,
            parentDroppableGroupId,
            droppableGroupId,
          } = action.payload;

          dispatch({
            type: EventType.WORKFLOW_STATUS_ADDED,
            payload: {
              ...action.payload,
            },
          });

          return executeAndMonitorCall(async () => {
            try {
              const result = await insertNewStatusInProposalWorkflow(
                proposalWorkflowId,
                sortOrder,
                droppableGroupId,
                parentDroppableGroupId,
                proposalStatusId,
                nextProposalStatusId,
                prevProposalStatusId
              );

              dispatch({
                type: EventType.WORKFLOW_STATUS_UPDATED,
                payload: {
                  ...action.payload,
                  id: result.id,
                },
              });

              return result;
            } catch (error) {
              dispatch({
                type: EventType.WORKFLOW_STATUS_DELETED,
                payload: {
                  source: { index: sortOrder, droppableId: droppableGroupId },
                },
              });
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
          const { workflowConnection, actions } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await addStatusActionToConnection(
              actions,
              workflowConnection
            );

            dispatch({
              type: EventType.STATUS_ACTION_ADDED,
              payload: {
                connectionId: workflowConnection.id,
                statusChangingEvents: result,
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
