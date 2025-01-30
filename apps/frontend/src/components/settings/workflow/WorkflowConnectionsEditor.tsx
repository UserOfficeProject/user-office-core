import {
  Draggable,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
} from '@hello-pangea/dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';

import {
  WorkflowConnection,
  WorkflowConnectionGroup,
  WorkflowType,
} from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AddNewWorkflowConnectionsRow from './AddNewWorkflowConnectionsRow';
import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';
import { Event, EventType } from './WorkflowEditorModel';

type WorkflowConnectionsEditorProps = {
  workflowStatusConnectionGroups: WorkflowConnectionGroup[];
  dispatch: React.Dispatch<Event>;
  isLoading: boolean;
  confirm: WithConfirmType;
  entityType: WorkflowType;
};

type WorkflowConnectionGroupWithSubGroups = WorkflowConnectionGroup & {
  subGroups: WorkflowConnectionGroupWithSubGroups[];
};

const WorkflowConnectionsEditor = ({
  workflowStatusConnectionGroups,
  dispatch,
  isLoading,
  confirm,
  entityType,
}: WorkflowConnectionsEditorProps) => {
  const theme = useTheme();
  const [openNewRowDialog, setOpenNewRowDialog] = useState(false);
  const [workflowConnection, setWorkflowConnection] =
    useState<WorkflowConnection | null>(null);

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ) => ({
    padding: theme.spacing(1),
    margin: '1px',
    backgroundColor: isDragging ? theme.palette.grey[200] : 'white',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    boxShadow: theme.shadows[2],
    maxWidth: '100%',
    ...draggableStyle,
  });

  const allWorkflowGroupIds = workflowStatusConnectionGroups.map(
    (workflowConnectionGroup) => workflowConnectionGroup.groupId
  );

  /**
   * One execution of this function returns a list of elements which are children of the given parentGroupId.
   * Call it with buildTree(myArray, 'proposalWorkflowConnections_1'), it will return a list of elements which have the parentGroupId === 'proposalWorkflowConnections_1'.
   * Initially this function is called with the parentGroupId being null, so elements without parentGroupId are returned, which are root nodes.
   * The function calls itself recursively to find children of children.
   */
  const buildWorkflowTree = (
    workflowConnectionGroups: WorkflowConnectionGroup[],
    parentId: string | null = null
  ) => {
    const result: WorkflowConnectionGroupWithSubGroups[] = [];

    workflowConnectionGroups.forEach(
      (workflowConnectionGroup: WorkflowConnectionGroup, index: number) => {
        const newElement: WorkflowConnectionGroupWithSubGroups = {
          ...workflowConnectionGroup,
          subGroups: [],
        };

        if (workflowConnectionGroup.parentGroupId === parentId) {
          const children = buildWorkflowTree(
            workflowConnectionGroups,
            newElement.groupId
          );

          if (children && children.length > 0) {
            newElement.subGroups = children.filter((child) => !!child);
          }

          result[index] = newElement;
        }
      }
    );

    return result;
  };

  const workflowTree = buildWorkflowTree(workflowStatusConnectionGroups);

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? theme.palette.primary.light : 'transparent',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  const getGridListCols = (cols: number) => {
    switch (cols) {
      case 2:
        return 6;
      case 3:
        return 4;
      case 4:
        return 3;
      case 6:
        return 2;

      default:
        return 12;
    }
  };

  const isVeryFirstDraftStatus = (workflowConnection: WorkflowConnection) =>
    workflowConnection.sortOrder === 0 &&
    workflowConnection.droppableGroupId ===
      `${entityType}WorkflowConnections_0`;

  const getUniqueKey = (workflowConnection: WorkflowConnection) => {
    return `${workflowConnection.status.shortCode}_${
      workflowConnection.status.id
    }_${workflowConnection.prevStatusId || ''}`;
  };

  const getConnectionGroupItems = (connections: WorkflowConnection[]) => {
    return connections.map((workflowConnection, index) => {
      const connectionHasActions = !!workflowConnection.statusActions?.length;

      return (
        <Draggable
          key={getUniqueKey(workflowConnection)}
          draggableId={getUniqueKey(workflowConnection)}
          index={index}
          isDragDisabled={true}
        >
          {(provided, snapshot) => (
            <>
              {!!workflowConnection.statusChangingEvents?.length && (
                <Box
                  component="small"
                  sx={{
                    textAlign: 'center',
                    display: 'block',
                    padding: '2px 0',
                    color: theme.palette.grey[500],
                  }}
                >
                  {workflowConnection.statusChangingEvents
                    .map(
                      (statusChangingEvent) =>
                        statusChangingEvent.statusChangingEvent
                    )
                    .join(' & ')}
                </Box>
              )}
              <Grid
                item
                xs={12}
                data-cy={`connection_${getUniqueKey(workflowConnection)}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
                sx={{
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: `${theme.palette.grey[100]} !important`,
                  },
                }}
                onClick={() => {
                  if (workflowConnection.prevStatusId) {
                    setWorkflowConnection(workflowConnection);
                  }
                }}
              >
                {!isVeryFirstDraftStatus(workflowConnection) && (
                  <DialogActions sx={{ padding: 0 }}>
                    <Tooltip title="Remove workflow connection">
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                        data-cy="remove-workflow-status-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirm(
                            () => {
                              dispatch({
                                type: EventType.DELETE_WORKFLOW_STATUS_REQUESTED,
                                payload: {
                                  source: {
                                    index,
                                    droppableId:
                                      workflowConnection.droppableGroupId,
                                  },
                                },
                              });
                            },
                            {
                              title: 'Remove workflow connection',
                              description: (
                                <>
                                  Are you sure you want to remove{' '}
                                  <b>{workflowConnection.status.name}</b>{' '}
                                  workflow connection?
                                </>
                              ),
                            }
                          )();
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {connectionHasActions && (
                      <Tooltip
                        title={`Status actions: ${workflowConnection.statusActions?.map(
                          (item) => item.action.name
                        )}`}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          margin: '5px',
                        }}
                      >
                        <PendingActionsIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </DialogActions>
                )}
                <Box fontSize="1rem">{workflowConnection.status.name}</Box>
                <Box fontSize="small" mt={1} color={theme.palette.grey[400]}>
                  {workflowConnection.status.description}
                </Box>
              </Grid>
            </>
          )}
        </Draggable>
      );
    });
  };

  const getConnectionGroupSubGroups = (
    subGroups: WorkflowConnectionGroupWithSubGroups[]
  ) => {
    return subGroups.map((subGroup) => (
      <Grid item xs={getGridListCols(subGroups.length)} key={subGroup.groupId}>
        <Droppable droppableId={subGroup.groupId} key={subGroup.groupId}>
          {(provided, snapshot) => (
            <Grid
              item
              xs={12}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              sx={{ minHeight: '70px' }}
              data-cy="droppable-group"
            >
              <Box
                component="small"
                sx={{
                  padding: theme.spacing(1),
                  color: theme.palette.grey[500],
                }}
              >
                Workflow droppable group {subGroup.groupId.split('_')[1]}
              </Box>
              {getConnectionGroupItems(subGroup.connections)}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
        <Grid container>
          {subGroup && subGroup.subGroups && subGroup.subGroups.length > 0
            ? getConnectionGroupSubGroups(subGroup.subGroups)
            : null}
        </Grid>
      </Grid>
    ));
  };

  const getConnectionGroup = (
    connectionGroup: WorkflowConnectionGroupWithSubGroups
  ) => {
    return (
      <Grid container key={`${connectionGroup.groupId}_container`}>
        <Droppable
          droppableId={connectionGroup.groupId}
          key={connectionGroup.groupId}
        >
          {(provided, snapshot) => (
            <Grid
              item
              xs={12}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              sx={{ minHeight: '70px' }}
              data-cy="droppable-group"
            >
              {connectionGroup.subGroups.length > 0 && (
                <Box
                  component="small"
                  sx={{
                    padding: theme.spacing(1),
                    color: theme.palette.grey[500],
                  }}
                >
                  Default droppable group
                </Box>
              )}
              {getConnectionGroupItems(connectionGroup.connections)}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
        {getConnectionGroupSubGroups(connectionGroup.subGroups)}
      </Grid>
    );
  };

  const connectionGroups = workflowTree.map((element) =>
    getConnectionGroup(element)
  );

  return (
    <Grid
      container
      className="tinyScroll"
      sx={{
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        flexBasis: '100%',
        height: '100%',
        maxHeight: theme.breakpoints.up('xl') ? '1400px' : '850px',
        overflowY: 'auto',
        backgroundColor: theme.palette.grey[200],
        boxShadow: theme.shadows[3],
      }}
      data-cy="workflow-connections"
    >
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openNewRowDialog}
        onClose={(): void => setOpenNewRowDialog(false)}
      >
        <DialogContent>
          <AddNewWorkflowConnectionsRow
            parentDroppableIds={allWorkflowGroupIds}
            close={(): void => setOpenNewRowDialog(false)}
            addNewWorkflowConnectionsRow={(
              numberOfColumns,
              parentDroppableId
            ) =>
              dispatch({
                type: EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLUMNS,
                payload: { numberOfColumns, parentDroppableId },
              })
            }
          />
        </DialogContent>
      </Dialog>
      <StatusEventsAndActionsDialog
        workflowConnection={workflowConnection}
        setWorkflowConnection={setWorkflowConnection}
        dispatch={dispatch}
        isLoading={isLoading}
        entityType={entityType}
      />
      <Grid
        item
        xs={12}
        sx={{
          flexGrow: 1,
          color: theme.palette.grey[900],
          fontWeight: 'bold',
          padding: theme.spacing(1),
        }}
      >
        Workflow
        <Button
          sx={{ float: 'right' }}
          onClick={() => setOpenNewRowDialog(true)}
          variant="text"
        >
          Add multi-column row
        </Button>
      </Grid>
      {connectionGroups}
    </Grid>
  );
};

export default withConfirm(WorkflowConnectionsEditor);
