import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from '@hello-pangea/dnd';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import React from 'react';

import {
  ProposalWorkflowConnection,
  Status,
  WorkflowConnectionGroup,
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

const ProposalWorkflowEditor = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();
  const reducerMiddleware = () => {
    return (next: FunctionType) => (action: Event) => {
      next(action);
    };
  };
  const { persistModel, isLoading } = usePersistProposalWorkflowEditorModel();
  const { state, dispatch } = ProposalWorkflowEditorModel([
    persistModel,
    reducerMiddleware,
  ]);

  const proposalWorkflowConnectionsPartOfWorkflow: ProposalWorkflowConnection[] =
    [];

  state.workflowConnectionGroups.forEach((proposalWorkflowConnectionGroup) =>
    proposalWorkflowConnectionsPartOfWorkflow.push(
      ...proposalWorkflowConnectionGroup.connections
    )
  );

  const proposalStatusesInThePicker = state.id ? proposalStatuses : [];

  const getPreviousWorkflowStatus = (
    destinationIndex: number,
    currentDroppableGroup: WorkflowConnectionGroup
  ) => {
    const parentDroppableGroup = state.workflowConnectionGroups.find(
      (proposalWorkflowConnectionGroup) =>
        proposalWorkflowConnectionGroup.groupId ===
        currentDroppableGroup.parentGroupId
    );

    const isFirstInTheGroupAndHasParentGroup =
      destinationIndex === 0 && currentDroppableGroup.parentGroupId;

    const lastWorkflowStatusInParentGroup =
      parentDroppableGroup?.connections[
        parentDroppableGroup?.connections.length - 1
      ]?.status;

    const previousWorkflowStatusInCurrentGroup =
      currentDroppableGroup.connections[destinationIndex - 1]?.status;

    return isFirstInTheGroupAndHasParentGroup
      ? lastWorkflowStatusInParentGroup || null
      : previousWorkflowStatusInCurrentGroup || null;
  };

  // TODO: Check this about getting next status in the workflow. It should be similar to getting previous.
  const getNextWorkflowStatuses = (
    destination: DraggableLocation,
    currentDroppableGroup: WorkflowConnectionGroup
  ): Status[] => {
    const isLastInTheCurrentGroup =
      destination.index === currentDroppableGroup.connections.length;
    const childGroups = state.workflowConnectionGroups.filter(
      (proposalWorkflowConnectionGroup) =>
        proposalWorkflowConnectionGroup.parentGroupId ===
        currentDroppableGroup.groupId
    );

    const isLastInTheGroupAndHasChildGroup =
      isLastInTheCurrentGroup && childGroups?.length > 0;

    return isLastInTheGroupAndHasChildGroup
      ? childGroups.flatMap((childGroup) =>
          childGroup.connections.map((connection) => connection.status)
        ) || []
      : [currentDroppableGroup.connections[destination.index]?.status];
  };

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    console.log({ source, destination });
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
      const currentDroppableGroup = state.workflowConnectionGroups.find(
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
      console.log({ proposalStatusId, destination, currentDroppableGroup });
      const nextProposalStatusesId = getNextWorkflowStatuses(
        destination,
        currentDroppableGroup as WorkflowConnectionGroup
      ).map((status) => status?.id);
      const prevStatusId = getPreviousWorkflowStatus(
        destination.index,
        currentDroppableGroup as WorkflowConnectionGroup
      )?.id;
      const [firstNextProposalStatusId] = nextProposalStatusesId;

      const isRepeatingTheSameStatus =
        nextProposalStatusesId?.some(
          (statusId) => statusId === proposalStatusId
        ) || proposalStatusId === prevStatusId;

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
          statusId: proposalStatusId,
          status: {
            ...proposalStatusesInThePicker[source.index],
          },
          nextStatusId: firstNextProposalStatusId,
          prevStatusId,
          workflowId: state.id,
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
                isLoading={isLoading}
                proposalWorkflowStatusConnectionGroups={
                  state.workflowConnectionGroups
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
