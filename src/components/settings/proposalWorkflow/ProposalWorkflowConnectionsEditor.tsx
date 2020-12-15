import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Delete from '@material-ui/icons/Delete';
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
import AddNextStatusEventsToConnection from './AddNextStatusEventsToConnection';
import { Event, EventType } from './ProposalWorkflowEditorModel';

type ProposalWorkflowConnectionsEditorProps = {
  proposalWorkflowStatusConnectionGroups: ProposalWorkflowConnectionGroup[];
  dispatch: React.Dispatch<Event>;
};

type ProposalWorkflowConnectionGroupWithSubGroups = ProposalWorkflowConnectionGroup & {
  subGroups: ProposalWorkflowConnectionGroupWithSubGroups[];
};

const ProposalWorkflowConnectionsEditor: React.FC<ProposalWorkflowConnectionsEditorProps> = ({
  proposalWorkflowStatusConnectionGroups,
  dispatch,
}) => {
  const theme = useTheme();
  const [openNewRowDialog, setOpenNewRowDialog] = useState(false);
  const [
    workflowConnection,
    setWorkflowConnection,
  ] = useState<ProposalWorkflowConnection | null>(null);
  const classes = makeStyles(theme => ({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      flexBasis: '100%',
      height: '100%',
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
      '&:hover': {
        backgroundColor: `${theme.palette.grey[100]} !important`,
      },
    },
    title: {
      flexGrow: 1,
      color: theme.palette.grey[600],
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
    nextStatusEvents: {
      textAlign: 'center',
      display: 'block',
      padding: '2px 0',
      color: theme.palette.grey[500],
    },
  }))();

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
    proposalWorkfowConnectionGroup => proposalWorkfowConnectionGroup.groupId
  );

  /**
   * One execution of this function returns a list of elements which are children of the given parentGroupId.
   * Call it with buildTree(myArray, 'proposalWorkflowConnections_1'), it will return a list of elements which have the parentGroupId === 'proposalWorkflowConnections_1'.
   * Initially this function is called with the parentGroupId being null, so elements without parentGroupId are returned, which are root nodes.
   * The function calls itself recursively to find children of children.
   */
  const buildWorkflowTree = (
    proposalWorkfowConnectionGroups: ProposalWorkflowConnectionGroup[],
    parentId: string | null = null
  ) => {
    const result: ProposalWorkflowConnectionGroupWithSubGroups[] = [];

    proposalWorkfowConnectionGroups.forEach(
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
            proposalWorkfowConnectionGroups,
            newElement.groupId
          );

          if (children && children.length > 0) {
            newElement.subGroups = children.filter(child => !!child);
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

  const isDraftStatus = (
    proposalWorkflowConnection: ProposalWorkflowConnection
  ) =>
    proposalWorkflowConnection.proposalStatus.id === 1 &&
    proposalWorkflowConnection.proposalStatus.shortCode === 'DRAFT';

  const getConnectionGroupItems = (
    connections: ProposalWorkflowConnection[]
  ) => {
    return connections.map((proposalWorkflowConnection, index) => {
      return (
        <Draggable
          key={`${proposalWorkflowConnection.proposalStatus.id}_${proposalWorkflowConnection.proposalStatus.shortCode}`}
          draggableId={`${proposalWorkflowConnection.proposalStatus.id}_${proposalWorkflowConnection.proposalStatus.shortCode}`}
          index={index}
          isDragDisabled={true}
        >
          {(provided, snapshot) => (
            <>
              <Grid
                item
                xs={12}
                data-cy={`connection_${proposalWorkflowConnection.proposalStatus.shortCode}_${proposalWorkflowConnection.proposalStatus.id}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
                className={classes.item}
                onClick={() => {
                  if (proposalWorkflowConnection.nextProposalStatusId) {
                    setWorkflowConnection(proposalWorkflowConnection);
                  }
                }}
              >
                {!isDraftStatus(proposalWorkflowConnection) && (
                  <DialogActions className={classes.dialogActions}>
                    <IconButton
                      size="small"
                      className={classes.removeButton}
                      data-cy="remove-workflow-status-button"
                      onClick={e => {
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
              {!!proposalWorkflowConnection.nextStatusEvents?.length && (
                <small className={classes.nextStatusEvents}>
                  {proposalWorkflowConnection.nextStatusEvents
                    .map(nextEventStatus => nextEventStatus.nextStatusEvent)
                    .join(' & ')}
                </small>
              )}
            </>
          )}
        </Draggable>
      );
    });
  };

  const getConnectionGroupSubGroups = (
    subGroups: ProposalWorkflowConnectionGroupWithSubGroups[]
  ) => {
    return subGroups.map(subGroup => (
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

  const connectionGroups = workflowTree.map(element =>
    getConnectionGroup(element)
  );

  return (
    <Grid
      container
      className={classes.container}
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
                type: EventType.ADD_NEW_ROW_WITH_MULTIPLE_COLLUMNS,
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
        data-cy="next-status-events-modal"
      >
        <DialogContent>
          <AddNextStatusEventsToConnection
            close={(): void => setWorkflowConnection(null)}
            nextStatusEvents={
              workflowConnection?.nextStatusEvents?.map(
                nextStatusEvent => nextStatusEvent.nextStatusEvent
              ) as ProposalEvent[]
            }
            addNextStatusEventsToConnection={(nextStatusEvents: string[]) =>
              dispatch({
                type: EventType.ADD_NEXT_STATUS_EVENTS_REQUESTED,
                payload: {
                  nextStatusEvents,
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
        >
          Add multicolumn row
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
