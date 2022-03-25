import Delete from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Draggable,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import {
  ProposalWorkflowConnection,
  ProposalWorkflowConnectionGroup,
} from 'generated/sdk';
import { Event as ProposalEvent } from 'generated/sdk';

import AddNewWorkflowConnectionsRow from './AddNewWorkflowConnectionsRow';
import AddStatusChangingEventsToConnection from './AddStatusChangingEventsToConnection';
import { Event, EventType } from './ProposalWorkflowEditorModel';

type ProposalWorkflowConnectionsEditorProps = {
  proposalWorkflowStatusConnectionGroups: ProposalWorkflowConnectionGroup[];
  dispatch: React.Dispatch<Event>;
};

type ProposalWorkflowConnectionGroupWithSubGroups =
  ProposalWorkflowConnectionGroup & {
    subGroups: ProposalWorkflowConnectionGroupWithSubGroups[];
  };

const ProposalWorkflowConnectionsEditor: React.FC<
  ProposalWorkflowConnectionsEditorProps
> = ({ proposalWorkflowStatusConnectionGroups, dispatch }) => {
  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const [openNewRowDialog, setOpenNewRowDialog] = useState(false);
  const [workflowConnection, setWorkflowConnection] =
    useState<ProposalWorkflowConnection | null>(null);
  const classes = makeStyles({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      flexBasis: '100%',
      height: '100%',
      maxHeight: isExtraLargeScreen ? '1400px' : '850px',
      overflowY: 'auto',
      backgroundColor: theme.palette.grey[200],
      boxShadow: '5px 7px 9px -5px rgba(0,0,0,0.29)',
    },
    dialogActions: {
      padding: 0,
    },
    removeButton: {
      position: 'absolute',
      marginLeft: '5px',
      marginTop: '5px',
    },
    itemContainer: {
      minHeight: '70px',
    },
    item: {
      position: 'relative',
      '&:hover': {
        backgroundColor: `${theme.palette.grey[100]} !important`,
      },
    },
    title: {
      flexGrow: 1,
      color: theme.palette.grey[900],
      fontWeight: 'bold',
      padding: '12px 8px 8px 8px',
    },
    addRowButton: {
      float: 'right',
    },
    groupTitle: {
      padding: '5px',
      color: theme.palette.grey[500],
    },
    statusChangingEvents: {
      textAlign: 'center',
      display: 'block',
      padding: '2px 0',
      color: theme.palette.grey[500],
    },
  })();

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
  ) => ({
    padding: '12px 8px 8px 8px',
    margin: '1px',
    backgroundColor: isDragging ? theme.palette.grey[200] : 'white',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    boxShadow: '0px 1px 2px 0px rgba(163,163,163,0.66)',
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
    proposalWorkflowConnectionGroups: ProposalWorkflowConnectionGroup[],
    parentId: string | null = null
  ) => {
    const result: ProposalWorkflowConnectionGroupWithSubGroups[] = [];

    proposalWorkflowConnectionGroups.forEach(
      (
        proposalWorkflowConnectionGroup: ProposalWorkflowConnectionGroup,
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
    proposalWorkflowConnection.proposalStatus.id === 1 &&
    proposalWorkflowConnection.proposalStatus.shortCode === 'DRAFT' &&
    proposalWorkflowConnection.sortOrder === 0 &&
    proposalWorkflowConnection.droppableGroupId ===
      'proposalWorkflowConnections_0';

  const getUniqueKey = (
    proposalWorkflowConnection: ProposalWorkflowConnection
  ) => {
    return `${proposalWorkflowConnection.proposalStatus.shortCode}_${
      proposalWorkflowConnection.proposalStatus.id
    }_${proposalWorkflowConnection.prevProposalStatusId || ''}`;
  };

  const getConnectionGroupItems = (
    connections: ProposalWorkflowConnection[]
  ) => {
    return connections.map((proposalWorkflowConnection, index) => {
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
                <small className={classes.statusChangingEvents}>
                  {proposalWorkflowConnection.statusChangingEvents
                    .map(
                      (statusChangingEvent) =>
                        statusChangingEvent.statusChangingEvent
                    )
                    .join(' & ')}
                </small>
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
                className={classes.item}
                onClick={() => {
                  if (proposalWorkflowConnection.prevProposalStatusId) {
                    setWorkflowConnection(proposalWorkflowConnection);
                  }
                }}
              >
                {!isVeryFirstDraftStatus(proposalWorkflowConnection) && (
                  <DialogActions className={classes.dialogActions}>
                    <IconButton
                      size="small"
                      className={classes.removeButton}
                      data-cy="remove-workflow-status-button"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </DialogActions>
                )}
                <Box fontSize="1rem">
                  {proposalWorkflowConnection.proposalStatus.name}
                </Box>
                <Box fontSize="small" mt={1} color={theme.palette.grey[400]}>
                  {proposalWorkflowConnection.proposalStatus.description}
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
              className={classes.itemContainer}
              data-cy="droppable-group"
            >
              <small className={classes.groupTitle}>
                Workflow droppable group {subGroup.groupId.split('_')[1]}
              </small>
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
              className={classes.itemContainer}
              data-cy="droppable-group"
            >
              {connectionGroup.subGroups.length > 0 && (
                <small className={classes.groupTitle}>
                  Default droppable group
                </small>
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
      className={`${classes.container} tinyScroll`}
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
      <Dialog
        maxWidth="md"
        fullWidth={true}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!workflowConnection}
        onClose={(): void => setWorkflowConnection(null)}
        data-cy="status-changing-events-modal"
      >
        <DialogContent>
          <AddStatusChangingEventsToConnection
            close={(): void => setWorkflowConnection(null)}
            statusChangingEvents={
              workflowConnection?.statusChangingEvents?.map(
                (statusChangingEvent) => statusChangingEvent.statusChangingEvent
              ) as ProposalEvent[]
            }
            statusName={workflowConnection?.proposalStatus.name}
            addStatusChangingEventsToConnection={(
              statusChangingEvents: string[]
            ) =>
              dispatch({
                type: EventType.ADD_NEXT_STATUS_EVENTS_REQUESTED,
                payload: {
                  statusChangingEvents,
                  workflowConnection,
                },
              })
            }
          />
        </DialogContent>
      </Dialog>
      <Grid item xs={12} className={classes.title}>
        Proposal workflow
        <Button
          className={classes.addRowButton}
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

export default ProposalWorkflowConnectionsEditor;
