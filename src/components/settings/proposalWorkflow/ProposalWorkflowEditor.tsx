import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useSnackbar } from 'notistack';
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

import { usePersistProposalWorkflowEditorModel } from 'hooks/settings/usePersistProposalWorkflowEditorModel';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { StyledPaper } from 'styles/StyledComponents';

import ProposalStatusPicker from './ProposalStatusPicker';
import ProposalWorkflowConnectionsEditor from './ProposalWorkflowConnectionsEditor';
import ProposalWorkflowEditorModel, {
  Event,
  EventType,
} from './ProposalWorkflowEditorModel';
import ProposalWorkflowMetadataEditor from './ProposalWorkflowMetadataEditor';

const ProposalWorkflowEditor: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    proposalStatuses,
    loadingProposalStatuses,
  } = useProposalStatusesData();
  const reducerMiddleware = () => {
    return (next: Function) => (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SERVICE_ERROR_OCCURRED:
          enqueueSnackbar(action.payload, { variant: 'error' });
          break;
      }
    };
  };
  const { persistModel, isLoading } = usePersistProposalWorkflowEditorModel();
  const { state, dispatch } = ProposalWorkflowEditorModel([
    persistModel,
    reducerMiddleware,
  ]);

  const proposalStatusesPartOfWorkflow = state.proposalWorkflowConnections.map(
    proposalWorkflowConnection => proposalWorkflowConnection.proposalStatus
  );

  const proposalStatusesInThePicker = proposalStatuses.filter(
    proposalStatus =>
      !proposalStatusesPartOfWorkflow.find(
        proposalStatusPartOfWorkflow =>
          proposalStatusPartOfWorkflow.id === proposalStatus.id
      )
  );

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;

    if (
      !destination ||
      (destination?.droppableId === source?.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    if (
      source.droppableId === 'proposalStatusPicker' &&
      destination?.droppableId === 'proposalWorkflowConnections'
    ) {
      const proposalStatusId = proposalStatusesInThePicker[source.index].id;
      const nextProposalStatusId =
        state.proposalWorkflowConnections[destination.index]?.proposalStatus
          .id || null;
      const prevProposalStatusId =
        state.proposalWorkflowConnections[destination.index - 1]?.proposalStatus
          .id || null;

      dispatch({
        type: EventType.ADD_WORKFLOW_STATUS_REQUESTED,
        payload: {
          source,
          sortOrder: destination.index,
          proposalStatusId,
          proposalStatus: {
            ...proposalStatusesInThePicker[source.index],
          },
          nextProposalStatusId,
          prevProposalStatusId,
          proposalWorkflowId: state.id,
        },
      });
    } else if (
      source.droppableId === 'proposalWorkflowConnections' &&
      destination?.droppableId === 'proposalWorkflowConnections'
    ) {
      dispatch({
        type: EventType.REORDER_WORKFLOW_STATUS_REQUESTED,
        payload: {
          source,
          destination,
        },
      });
    } else if (
      source.droppableId === 'proposalWorkflowConnections' &&
      destination?.droppableId === 'proposalStatusPicker'
    ) {
      dispatch({
        type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
        payload: {
          source,
          destination,
        },
      });
    }
  };

  const getContainerStyle = () => {
    return isLoading || loadingProposalStatuses || state.id === 0
      ? {
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
          minHeight: '380px',
        }
      : {};
  };

  const progressJsx =
    isLoading || loadingProposalStatuses || state.id === 0 ? (
      <LinearProgress />
    ) : null;

  return (
    <>
      <ProposalWorkflowMetadataEditor
        dispatch={dispatch}
        proposalWorkflow={state}
      />
      <StyledPaper style={getContainerStyle()}>
        {progressJsx}
        <DragDropContext onDragEnd={onDragEnd}>
          <Box display="flex">
            <>
              <ProposalWorkflowConnectionsEditor
                proposalWorkflowStatusConnections={
                  state.proposalWorkflowConnections
                }
              />
              {state.id !== 0 && (
                <ProposalStatusPicker
                  proposalStatuses={proposalStatusesInThePicker}
                />
              )}
            </>
          </Box>
        </DragDropContext>
      </StyledPaper>
    </>
  );
};

export default ProposalWorkflowEditor;
