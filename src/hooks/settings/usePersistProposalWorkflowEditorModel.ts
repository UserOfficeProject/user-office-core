import { useState } from 'react';

import {
  Event,
  EventType,
} from 'components/settings/proposalWorkflow/ProposalWorkflowEditorModel';
import { IndexWithGroupId, ProposalWorkflow } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

export function usePersistProposalWorkflowEditorModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { api } = useDataApiWithFeedback();

  const updateProposalWorkflowMetadata = async (
    id: number,
    name: string,
    description: string
  ) => {
    return api('Proposal workflow updated successfully!')
      .updateProposalWorkflow({
        id,
        name,
        description,
      })
      .then(data => data.updateProposalWorkflow);
  };

  type MonitorableServiceCall = () => Promise<{
    error?: string | null;
  }>;

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
      return api('Workflow status added successfully')
        .addProposalWorkflowStatus({
          proposalWorkflowId,
          sortOrder,
          droppableGroupId,
          parentDroppableGroupId,
          proposalStatusId,
          nextProposalStatusId,
          prevProposalStatusId,
        })
        .then(data => data.addProposalWorkflowStatus);
    };

    const reorderStatusesInProposalWorkflow = async (
      from: IndexWithGroupId,
      to: IndexWithGroupId,
      proposalWorkflowId: number
    ) => {
      return api('Workflow statuses reordered successfully')
        .moveProposalWorkflowStatus({
          from,
          to,
          proposalWorkflowId,
        })
        .then(data => data.moveProposalWorkflowStatus);
    };

    const deleteProposalWorkflowStatus = async (
      proposalStatusId: number,
      proposalWorkflowId: number
    ) => {
      return api('Workflow status removed successfully')
        .deleteProposalWorkflowStatus({
          proposalStatusId,
          proposalWorkflowId,
        })
        .then(data => data.deleteProposalWorkflowStatus);
    };

    const addNextStatusEventsToConnection = async (
      proposalWorkflowConnectionId: number,
      nextStatusEvents: string[]
    ) => {
      return api('Next status events added successfully!')
        .addNextStatusEventsToConnection({
          proposalWorkflowConnectionId,
          nextStatusEvents,
        })
        .then(data => data.addNextStatusEventsToConnection);
    };

    return (next: Function) => (action: Event) => {
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

            if (result.proposalWorkflow) {
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
            const result = await reorderStatusesInProposalWorkflow(
              source,
              destination,
              state.id
            );

            if (result.error) {
              dispatch({
                type: EventType.REORDER_WORKFLOW_STATUS_FAILED,
                payload: {
                  source: destination,
                  destination: source,
                },
              });
            }

            return result;
          });
        case EventType.DELETE_WORKFLOW_STATUS_REQUESTED:
          dispatch({
            type: EventType.WORKFLOW_STATUS_DELETED,
            payload: action.payload,
          });

          const groupToRemoveFrom = state.proposalWorkflowConnectionGroups.find(
            proposalWorkflowConnectionGroup =>
              proposalWorkflowConnectionGroup.groupId ===
              action.payload.source.droppableId
          );
          const proposalWorkflowConnectionToRemove =
            groupToRemoveFrom?.connections[action.payload.source.index];

          if (proposalWorkflowConnectionToRemove) {
            return executeAndMonitorCall(async () => {
              const result = await deleteProposalWorkflowStatus(
                proposalWorkflowConnectionToRemove.proposalStatusId,
                proposalWorkflowConnectionToRemove.proposalWorkflowId
              );

              if (result.error) {
                dispatch({
                  type: EventType.WORKFLOW_STATUS_ADDED,
                  payload: {
                    ...proposalWorkflowConnectionToRemove,
                    source: action.payload.source,
                  },
                });
              }

              return result;
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
                id: result.proposalWorkflowConnection?.id,
              },
            });

            if (result.error) {
              dispatch({
                type: EventType.WORKFLOW_STATUS_DELETED,
                payload: {
                  source: { index: sortOrder, droppableId: droppableGroupId },
                },
              });
            }

            return result;
          });
        }

        case EventType.ADD_NEXT_STATUS_EVENTS_REQUESTED: {
          const { workflowConnection, nextStatusEvents } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await addNextStatusEventsToConnection(
              workflowConnection.id,
              nextStatusEvents
            );

            if (!result.error) {
              dispatch({
                type: EventType.NEXT_STATUS_EVENTS_ADDED,
                payload: {
                  workflowConnection,
                  nextStatusEvents: result.nextStatusEvents,
                },
              });
            }

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
