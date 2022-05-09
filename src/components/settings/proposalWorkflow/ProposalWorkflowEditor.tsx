import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import React from 'react';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from 'react-beautiful-dnd';

import {
  ProposalStatus,
  ProposalWorkflowConnection,
  ProposalWorkflowConnectionGroup,
} from 'generated/sdk';
import { usePersistProposalWorkflowEditorModel } from 'hooks/settings/usePersistProposalWorkflowEditorModel';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { FunctionType } from 'utils/utilTypes';

import ProposalStatusPicker from './ProposalStatusPicker';
import ProposalWorkflowConnectionsEditor from './ProposalWorkflowConnectionsEditor';
import ProposalWorkflowEditorModel, {
  Event,
  EventType,
} from './ProposalWorkflowEditorModel';
import ProposalWorkflowMetadataEditor from './ProposalWorkflowMetadataEditor';

const ProposalWorkflowEditor: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();
  const reducerMiddleware = () => {
    return (next: FunctionType) => (action: Event) => {
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

  const proposalWorkflowConnectionsPartOfWorkflow: ProposalWorkflowConnection[] =
    [];

  state.proposalWorkflowConnectionGroups.forEach(
    (proposalWorkflowConnectionGroup) =>
      proposalWorkflowConnectionsPartOfWorkflow.push(
        ...proposalWorkflowConnectionGroup.connections
      )
  );

  const proposalStatusesInThePicker = state.id ? proposalStatuses : [];

  const getPreviousWorkflowStatus = (
    destinationIndex: number,
    currentDroppableGroup: ProposalWorkflowConnectionGroup
  ) => {
    const parentDroppableGroup = state.proposalWorkflowConnectionGroups.find(
      (proposalWorkflowConnectionGroup) =>
        proposalWorkflowConnectionGroup.groupId ===
        currentDroppableGroup.parentGroupId
    );

    const isFirstInTheGroupAndHasParentGroup =
      destinationIndex === 0 && currentDroppableGroup.parentGroupId;

    const lastWorkflowStatusInParentGroup =
      parentDroppableGroup?.connections[
        parentDroppableGroup?.connections.length - 1
      ]?.proposalStatus;

    const previousWorkflowStatusInCurrentGroup =
      currentDroppableGroup.connections[destinationIndex - 1]?.proposalStatus;

    return isFirstInTheGroupAndHasParentGroup
      ? lastWorkflowStatusInParentGroup || null
      : previousWorkflowStatusInCurrentGroup || null;
  };

  // TODO: Check this about getting next status in the workflow. It should be similar to getting previous.
  const getNextWorkflowStatuses = (
    destination: DraggableLocation,
    currentDroppableGroup: ProposalWorkflowConnectionGroup
  ): ProposalStatus[] => {
    const isLastInTheCurrentGroup =
      destination.index === currentDroppableGroup.connections.length;
    const childGroups = state.proposalWorkflowConnectionGroups.filter(
      (proposalWorkflowConnectionGroup) =>
        proposalWorkflowConnectionGroup.parentGroupId ===
        currentDroppableGroup.groupId
    );

    const isLastInTheGroupAndHasChildGroup =
      isLastInTheCurrentGroup && childGroups?.length > 0;

    return isLastInTheGroupAndHasChildGroup
      ? childGroups.flatMap((childGroup) =>
          childGroup.connections.map((connection) => connection.proposalStatus)
        ) || []
      : [
          currentDroppableGroup.connections[destination.index]?.proposalStatus,
        ] || [];
  };

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;

    const isWrongDrop =
      destination?.droppableId === source?.droppableId &&
      source.index === destination.index;

    if (!destination || isWrongDrop) {
      return;
    }

    const isDragAndDropFromStatusPickerToWorkflowEditor =
      source.droppableId === 'proposalStatusPicker' &&
      destination.droppableId.startsWith('proposalWorkflowConnections');

    const isReorderingConnectionsInsideWorkflowEditor =
      source.droppableId.startsWith('proposalWorkflowConnections') &&
      destination?.droppableId.startsWith('proposalWorkflowConnections');

    const isDragAndDropFromWorkflowEditorToStatusPicker =
      source.droppableId.startsWith('proposalWorkflowConnections') &&
      destination?.droppableId === 'proposalStatusPicker';

    if (isDragAndDropFromStatusPickerToWorkflowEditor) {
      const currentDroppableGroup = state.proposalWorkflowConnectionGroups.find(
        (proposalWorkflowConnectionGroup) =>
          proposalWorkflowConnectionGroup.groupId === destination.droppableId
      );

      const isDroppedBeforeVeryFirstStatus =
        currentDroppableGroup?.groupId === 'proposalWorkflowConnections_0' &&
        destination.index === 0 &&
        currentDroppableGroup.connections.length > 0;

      if (isDroppedBeforeVeryFirstStatus) {
        enqueueSnackbar('Adding before first status is not allowed', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }

      const proposalStatusId = proposalStatusesInThePicker[source.index].id;
      const nextProposalStatusesId = getNextWorkflowStatuses(
        destination,
        currentDroppableGroup as ProposalWorkflowConnectionGroup
      ).map((status) => status?.id);
      const prevProposalStatusId = getPreviousWorkflowStatus(
        destination.index,
        currentDroppableGroup as ProposalWorkflowConnectionGroup
      )?.id;
      const [firstNextProposalStatusId] = nextProposalStatusesId;

      const isRepeatingTheSameStatus =
        nextProposalStatusesId?.some(
          (statusId) => statusId === proposalStatusId
        ) || proposalStatusId === prevProposalStatusId;

      if (isRepeatingTheSameStatus) {
        enqueueSnackbar('Repeating same status is not allowed', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }

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
          nextProposalStatusId: firstNextProposalStatusId,
          prevProposalStatusId,
          proposalWorkflowId: state.id,
        },
      });
    } else if (isReorderingConnectionsInsideWorkflowEditor) {
      // NOTE: For now reordering is disabled!
      // dispatch({
      //   type: EventType.REORDER_WORKFLOW_STATUS_REQUESTED,
      //   payload: {
      //     source,
      //     destination,
      //   },
      // });
      return;
    } else if (isDragAndDropFromWorkflowEditorToStatusPicker) {
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

  const getContainerStyle = (): React.CSSProperties => {
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
    <StyledContainer>
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
    </StyledContainer>
  );
};

export default ProposalWorkflowEditor;
