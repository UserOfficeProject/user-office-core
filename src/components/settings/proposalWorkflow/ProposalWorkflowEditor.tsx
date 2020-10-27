import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useSnackbar } from 'notistack';
import React from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';

import {
  ProposalWorkflowConnection,
  ProposalWorkflowConnectionGroup,
} from 'generated/sdk';
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

  // TODO: Cleanup a bit!!!

  const proposalWorkflowConnectionsPartOfWorkflow: ProposalWorkflowConnection[] = [];

  state.proposalWorkflowConnectionGroups.forEach(
    proposalWorkflowConnectionGroup =>
      proposalWorkflowConnectionsPartOfWorkflow.push(
        ...proposalWorkflowConnectionGroup.connections
      )
  );

  const proposalStatusesPartOfWorkflow = proposalWorkflowConnectionsPartOfWorkflow.map(
    proposalWorkflowConnection => proposalWorkflowConnection.proposalStatus
  );

  const proposalStatusesInThePicker = state.id
    ? proposalStatuses.filter(
        proposalStatus =>
          !proposalStatusesPartOfWorkflow.find(
            proposalStatusPartOfWorkflow =>
              proposalStatusPartOfWorkflow.id === proposalStatus.id
          )
      )
    : [];

  const getPreviousWorkflowStatus = (
    destinationIndex: number,
    currentDroppableGroup: ProposalWorkflowConnectionGroup
  ) => {
    const parentDroppableGroup = state.proposalWorkflowConnectionGroups.find(
      proposalWorkflowConnectionGroup =>
        proposalWorkflowConnectionGroup.groupId ===
        currentDroppableGroup.parentGroupId
    );

    const isFirstInTheGroupAndHasParentGroup =
      destinationIndex === 0 && currentDroppableGroup.parentGroupId;

    const lastWorkflowStatusInParentGroup =
      parentDroppableGroup?.connections[
        parentDroppableGroup?.connections.length - 1
      ]?.proposalStatus.id;

    const previousWorkflowStatusInCurrentGroup =
      currentDroppableGroup.connections[destinationIndex - 1]?.proposalStatus
        .id;

    return isFirstInTheGroupAndHasParentGroup
      ? lastWorkflowStatusInParentGroup || null
      : previousWorkflowStatusInCurrentGroup || null;
  };

  // TODO: Check this about getting next status in the workflow. It should be similar to getting previous.
  const getNextWorkflowStatus = (
    destination: DraggableLocation,
    currentDroppableGroup: ProposalWorkflowConnectionGroup
  ) => {
    const isLastInTheCurrentGroup =
      destination.index === currentDroppableGroup.connections.length;
    const childGroup = state.proposalWorkflowConnectionGroups.find(
      proposalWorkflowConnectionGroup =>
        proposalWorkflowConnectionGroup.parentGroupId ===
        currentDroppableGroup.groupId
    );

    const isLastInTheGroupAndHasChildGroup =
      isLastInTheCurrentGroup && childGroup;

    return isLastInTheGroupAndHasChildGroup
      ? childGroup?.connections[0].proposalStatus.id || null
      : currentDroppableGroup.connections[destination.index]?.proposalStatus
          .id || null;
  };

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
      destination?.droppableId.startsWith('proposalWorkflowConnections')
    ) {
      const currentDroppableGroup = state.proposalWorkflowConnectionGroups.find(
        proposalWorkflowConnectionGroup =>
          proposalWorkflowConnectionGroup.groupId === destination.droppableId
      );

      const proposalStatusId = proposalStatusesInThePicker[source.index].id;
      const nextProposalStatusId = getNextWorkflowStatus(
        destination,
        currentDroppableGroup as ProposalWorkflowConnectionGroup
      );
      const prevProposalStatusId = getPreviousWorkflowStatus(
        destination.index,
        currentDroppableGroup as ProposalWorkflowConnectionGroup
      );

      dispatch({
        type: EventType.ADD_WORKFLOW_STATUS_REQUESTED,
        payload: {
          source,
          sortOrder: destination.index,
          droppableGroupId: destination.droppableId,
          parentDroppableGroupId: currentDroppableGroup?.parentGroupId || null,
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
      source.droppableId.startsWith('proposalWorkflowConnections') &&
      destination?.droppableId.startsWith('proposalWorkflowConnections')
    ) {
      // NOTE: For now reordering is disabled!
      // dispatch({
      //   type: EventType.REORDER_WORKFLOW_STATUS_REQUESTED,
      //   payload: {
      //     source,
      //     destination,
      //   },
      // });
      return;
    } else if (
      source.droppableId.startsWith('proposalWorkflowConnections') &&
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

  const dataLoaded = !isLoading && !loadingProposalStatuses && state.id;

  const getContainerStyle = () => {
    return !dataLoaded
      ? {
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
          minHeight: '380px',
        }
      : {};
  };

  const progressJsx = !dataLoaded ? <LinearProgress /> : null;

  return (
    <>
      <ProposalWorkflowMetadataEditor
        dispatch={dispatch}
        proposalWorkflow={state}
      />
      <StyledPaper style={getContainerStyle()}>
        {progressJsx}
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container>
            <Grid item xs={9}>
              <ProposalWorkflowConnectionsEditor
                dispatch={dispatch}
                proposalWorkflowStatusConnectionGroups={
                  state.proposalWorkflowConnectionGroups
                }
              />
            </Grid>
            <Grid item xs={3}>
              <ProposalStatusPicker
                proposalStatuses={proposalStatusesInThePicker}
              />
            </Grid>
          </Grid>
        </DragDropContext>
      </StyledPaper>
    </>
  );
};

export default ProposalWorkflowEditor;
