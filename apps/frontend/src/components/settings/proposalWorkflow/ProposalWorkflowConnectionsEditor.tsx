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
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  ProposalWorkflowConnection,
  WorkflowConnectionGroup,
} from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AddNewWorkflowConnectionsRow from './AddNewWorkflowConnectionsRow';
import { Event, EventType } from './ProposalWorkflowEditorModel';
import StatusEventsAndActionsDialog from './StatusEventsAndActionsDialog';

type ProposalWorkflowConnectionsEditorProps = {
  proposalWorkflowStatusConnectionGroups: WorkflowConnectionGroup[];
  dispatch: React.Dispatch<Event>;
  isLoading: boolean;
  confirm: WithConfirmType;
};

type ProposalWorkflowConnectionGroupWithSubGroups = WorkflowConnectionGroup & {
  subGroups: ProposalWorkflowConnectionGroupWithSubGroups[];
};

const ProposalWorkflowConnectionsEditor = ({
  proposalWorkflowStatusConnectionGroups,
  dispatch,
  isLoading,
  confirm,
}: ProposalWorkflowConnectionsEditorProps) => {
  const theme = useTheme();
  const [openNewRowDialog, setOpenNewRowDialog] = useState(false);
  const [workflowConnection, setWorkflowConnection] =
    useState<ProposalWorkflowConnection | null>(null);

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

  const allWorkflowGroupIds = proposalWorkflowStatusConnectionGroups.map(
    (proposalWorkflowConnectionGroup) => proposalWorkflowConnectionGroup.groupId
  );

  /**
   * One execution of this function returns a list of elements which are children of the given parentGroupId.
   * Call it with buildTree(myArray, 'proposalWorkflowConnections_1'), it will return a list of elements which have the parentGroupId === 'proposalWorkflowConnections_1'.
   * Initially this function is called with the parentGroupId being null, so elements without parentGroupId are returned, which are root nodes.
   * The function calls itself recursively to find children of children.
   */
  const buildWorkflowTree = (
    proposalWorkflowConnectionGroups: WorkflowConnectionGroup[],
    parentId: string | null = null
  ) => {
    const result: ProposalWorkflowConnectionGroupWithSubGroups[] = [];

    proposalWorkflowConnectionGroups.forEach(
      (
        proposalWorkflowConnectionGroup: WorkflowConnectionGroup,
        index: number
      ) => {
        const newElement: ProposalWorkflowConnectionGroupWithSubGroups = {
          ...proposalWorkflowConnectionGroup,
          subGroups: [],
        };

        if (proposalWorkflowConnectionGroup.parentGroupId === parentId) {
          const children = buildWorkflowTree(
            proposalWorkflowConnectionGroups,
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

  const workflowTree = buildWorkflowTree(
    proposalWorkflowStatusConnectionGroups
  );

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

  const isVeryFirstDraftStatus = (
    proposalWorkflowConnection: ProposalWorkflowConnection
  ) =>
    proposalWorkflowConnection.status.id === 1 &&
    proposalWorkflowConnection.status.shortCode === 'DRAFT' &&
    proposalWorkflowConnection.sortOrder === 0 &&
    proposalWorkflowConnection.droppableGroupId ===
      'proposalWorkflowConnections_0';

  const getUniqueKey = (
    proposalWorkflowConnection: ProposalWorkflowConnection
  ) => {
    return `${proposalWorkflowConnection.status.shortCode}_${
      proposalWorkflowConnection.status.id
    }_${proposalWorkflowConnection.prevStatusId || ''}`;
  };

  const getConnectionGroupItems = (
    connections: ProposalWorkflowConnection[]
  ) => {
    return connections.map((proposalWorkflowConnection, index) => {
      const connectionHasActions =
        !!proposalWorkflowConnection.statusActions?.length;

      return (
        <Draggable
          key={getUniqueKey(proposalWorkflowConnection)}
          draggableId={getUniqueKey(proposalWorkflowConnection)}
          index={index}
          isDragDisabled={true}
        >
          {(provided, snapshot) => (
            <>
              {!!proposalWorkflowConnection.statusChangingEvents?.length && (
                <Box
                  component="small"
                  sx={{
                    textAlign: 'center',
                    display: 'block',
                    padding: '2px 0',
                    color: theme.palette.grey[500],
                  }}
                >
                  {proposalWorkflowConnection.statusChangingEvents
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
                data-cy={`connection_${getUniqueKey(
                  proposalWorkflowConnection
                )}`}
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
                  if (proposalWorkflowConnection.prevStatusId) {
                    setWorkflowConnection(proposalWorkflowConnection);
                  }
                }}
              >
                {!isVeryFirstDraftStatus(proposalWorkflowConnection) && (
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
                                      proposalWorkflowConnection.droppableGroupId,
                                  },
                                },
                              });
                            },
                            {
                              title: 'Remove workflow connection',
                              description: (
                                <>
                                  Are you sure you want to remove{' '}
                                  <b>
                                    {proposalWorkflowConnection.status.name}
                                  </b>{' '}
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
                        title={`Status actions: ${proposalWorkflowConnection.statusActions?.map(
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
                <Box fontSize="1rem">
                  {proposalWorkflowConnection.status.name}
                </Box>
                <Box fontSize="small" mt={1} color={theme.palette.grey[400]}>
                  {proposalWorkflowConnection.status.description}
                </Box>
              </Grid>
            </>
          )}
        </Draggable>
      );
    });
  };

  const getConnectionGroupSubGroups = (
    subGroups: ProposalWorkflowConnectionGroupWithSubGroups[]
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
    connectionGroup: ProposalWorkflowConnectionGroupWithSubGroups
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
      data-cy="proposal-workflow-connections"
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
        Proposal workflow
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

ProposalWorkflowConnectionsEditor.propTypes = {
  proposalWorkflowStatusConnectionGroups: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default withConfirm(ProposalWorkflowConnectionsEditor);
