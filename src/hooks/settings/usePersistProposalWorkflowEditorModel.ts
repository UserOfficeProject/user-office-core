import { useState } from 'react';

import {
  Event,
  EventType,
} from 'components/settings/proposalWorkflow/ProposalWorkflowEditorModel';
import { ProposalWorkflow } from 'generated/sdk';
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
    return api()
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
      proposalStatusId: number,
      nextProposalStatusId: number,
      prevProposalStatusId: number,
      nextStatusEventType: string
    ) => {
      return api('Workflow status added successfully')
        .addProposalWorkflowStatus({
          proposalWorkflowId,
          sortOrder,
          droppableGroupId,
          proposalStatusId,
          nextProposalStatusId,
          prevProposalStatusId,
          nextStatusEventType,
        })
        .then(data => data.addProposalWorkflowStatus);
    };

    const reorderStatusesInProposalWorkflow = async (
      from: number,
      to: number,
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

          // return executeAndMonitorCall(async () => {
          //   const result = await reorderStatusesInProposalWorkflow(
          //     source.index,
          //     destination.index,
          //     state.id
          //   );

          //   if (result.error) {
          //     dispatch({
          //       type: EventType.REORDER_WORKFLOW_STATUS_FAILED,
          //       payload: {
          //         source: destination,
          //         destination: source,
          //       },
          //     });
          //   }

          //   return result;
          // });
          break;
        case EventType.DELETE_WORKFLOW_STATUS_REQUESTED:
          // const proposalWorkflowStatusToDelete =
          //   state.proposalWorkflowConnections[action.payload.source.index];

          dispatch({
            type: EventType.WORKFLOW_STATUS_DELETED,
            payload: action.payload,
          });

          // return executeAndMonitorCall(async () => {
          //   const result = await deleteProposalWorkflowStatus(
          //     proposalWorkflowStatusToDelete.proposalStatusId,
          //     proposalWorkflowStatusToDelete.proposalWorkflowId
          //   );

          //   if (result.error) {
          //     dispatch({
          //       type: EventType.WORKFLOW_STATUS_ADDED,
          //       payload: {
          //         ...proposalWorkflowStatusToDelete,
          //         source: action.payload.source,
          //       },
          //     });
          //   }

          //   return result;
          // });
          break;
        case EventType.ADD_WORKFLOW_STATUS_REQUESTED: {
          const {
            proposalWorkflowId,
            sortOrder,
            proposalStatusId,
            nextProposalStatusId,
            prevProposalStatusId,
            droppableGroupId,
          } = action.payload;
          // TODO: We should be able to define this event in the UI maybe. This is about what kind of event triggers proposal status to move forward in the workflow.
          const nextStatusEventType = 'DEFAULT_EVENT';

          dispatch({
            type: EventType.WORKFLOW_STATUS_ADDED,
            payload: action.payload,
          });

          return executeAndMonitorCall(async () => {
            const result = await insertNewStatusInProposalWorkflow(
              proposalWorkflowId,
              sortOrder,
              droppableGroupId,
              proposalStatusId,
              nextProposalStatusId,
              prevProposalStatusId,
              nextStatusEventType
            );

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
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
