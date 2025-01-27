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
  WorkflowConnection,
  Status,
  WorkflowConnectionGroup,
} from 'generated/sdk';
import { usePersistWorkflowEditorModel } from 'hooks/settings/usePersistWorkflowEditorModel';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { FunctionType } from 'utils/utilTypes';

import StatusPicker from './StatusPicker';
import WorkflowConnectionsEditor from './WorkflowConnectionsEditor';
import WorkflowEditorModel, { Event, EventType } from './WorkflowEditorModel';
import WorkflowMetadataEditor from './WorkflowMetadataEditor';

const WorkflowEditor = ({
  entityType,
}: {
  entityType: 'proposal' | 'experiment';
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { statuses, loadingStatuses } = useStatusesData(entityType);
  const reducerMiddleware = () => {
    return (next: FunctionType) => (action: Event) => {
      next(action);
    };
  };
  const { persistModel, isLoading } = usePersistWorkflowEditorModel();
  const { state, dispatch } = WorkflowEditorModel([
    persistModel,
    reducerMiddleware,
  ]);

  const workflowConnectionsPartOfWorkflow: WorkflowConnection[] = [];

  state.workflowConnectionGroups.forEach((workflowConnectionGroup) =>
    workflowConnectionsPartOfWorkflow.push(
      ...workflowConnectionGroup.connections
    )
  );
  const statusesInThePicker = state.id ? statuses : [];

  const getPreviousWorkflowStatus = (
    destinationIndex: number,
    currentDroppableGroup: WorkflowConnectionGroup
  ) => {
    const parentDroppableGroup = state.workflowConnectionGroups.find(
      (workflowConnectionGroup) =>
        workflowConnectionGroup.groupId === currentDroppableGroup.parentGroupId
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
      (workflowConnectionGroup) =>
        workflowConnectionGroup.parentGroupId === currentDroppableGroup.groupId
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
    console.log('=2============');
    const isDragAndDropFromStatusPickerToWorkflowEditor =
      source.droppableId === 'statusPicker' &&
      destination.droppableId.includes('WorkflowConnections');

    const isReorderingConnectionsInsideWorkflowEditor =
      source.droppableId.includes('WorkflowConnections') &&
      destination?.droppableId.includes('WorkflowConnections');

    const isDragAndDropFromWorkflowEditorToStatusPicker =
      source.droppableId.includes('WorkflowConnections') &&
      destination?.droppableId === 'statusPicker';
    console.log('=3============');
    if (isDragAndDropFromStatusPickerToWorkflowEditor) {
      const currentDroppableGroup = state.workflowConnectionGroups.find(
        (workflowConnectionGroup) =>
          workflowConnectionGroup.groupId === destination.droppableId
      );

      const isDroppedBeforeVeryFirstStatus =
        currentDroppableGroup?.groupId.endsWith('WorkflowConnections_0') &&
        destination.index === 0 &&
        currentDroppableGroup.connections.length > 0;
      console.log('===4==========');
      if (isDroppedBeforeVeryFirstStatus) {
        enqueueSnackbar('Adding before first status is not allowed', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }
      console.log('===5==========');
      const statusId = statusesInThePicker[source.index].id;
      const nextStatusesId = getNextWorkflowStatuses(
        destination,
        currentDroppableGroup as WorkflowConnectionGroup
      ).map((status) => status?.id);
      const prevStatusId = getPreviousWorkflowStatus(
        destination.index,
        currentDroppableGroup as WorkflowConnectionGroup
      )?.id;

      const [firstNextStatusId] = nextStatusesId;
      const isRepeatingTheSameStatus =
        nextStatusesId?.some((nextStatusId) => nextStatusId === statusId) ||
        statusId === prevStatusId;
      if (isRepeatingTheSameStatus) {
        enqueueSnackbar('Repeating same status is not allowed', {
          variant: 'info',
          className: 'snackbar-info',
        });

        return;
      }
      console.log({
        source,
        sortOrder: destination.index,
        droppableGroupId: destination.droppableId,
        parentDroppableGroupId: currentDroppableGroup?.parentGroupId || null,
        statusId: statusId,
        status: {
          ...statusesInThePicker[source.index],
        },
        nextStatusId: firstNextStatusId,
        prevStatusId,
        workflowId: state.id,
      });
      dispatch({
        type: EventType.ADD_WORKFLOW_STATUS_REQUESTED,
        payload: {
          source,
          sortOrder: destination.index,
          droppableGroupId: destination.droppableId,
          parentDroppableGroupId: currentDroppableGroup?.parentGroupId || null,
          statusId: statusId,
          status: {
            ...statusesInThePicker[source.index],
          },
          nextStatusId: firstNextStatusId,
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
  console.log({ state });
  const dataLoaded = !isLoading && !loadingStatuses && state.id;

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
      <WorkflowMetadataEditor dispatch={dispatch} workflow={state} />
      <StyledPaper style={getContainerStyle()}>
        {progressJsx}
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container>
            <Grid item xs={9}>
              <WorkflowConnectionsEditor
                dispatch={dispatch}
                isLoading={isLoading}
                workflowStatusConnectionGroups={state.workflowConnectionGroups}
              />
            </Grid>
            <Grid item xs={3}>
              <StatusPicker statuses={statusesInThePicker} />
            </Grid>
          </Grid>
        </DragDropContext>
      </StyledPaper>
    </StyledContainer>
  );
};

export default WorkflowEditor;
