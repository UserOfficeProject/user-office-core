import { DialogActions } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Delete from '@material-ui/icons/Delete';
import React from 'react';
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

import { Event, EventType } from './ProposalWorkflowEditorModel';

const ProposalWorkflowConnectionsEditor: React.FC<{
  proposalWorkflowStatusConnectionGroups: ProposalWorkflowConnectionGroup[];
  dispatch: React.Dispatch<Event>;
}> = ({ proposalWorkflowStatusConnectionGroups, dispatch }) => {
  const theme = useTheme();
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

  const workflowConnectionGroupsWithNumberOfSiblings = proposalWorkflowStatusConnectionGroups.map(
    proposalWorkflowStatusConnectionGroup => ({
      ...proposalWorkflowStatusConnectionGroup,
      numberOfSiblings: proposalWorkflowStatusConnectionGroups.filter(
        group =>
          group.previousGroupId ===
          proposalWorkflowStatusConnectionGroup.previousGroupId
      ).length,
    })
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

  const getConnectionGroupItems = (
    connections: ProposalWorkflowConnection[]
  ) => {
    return connections.map((proposalWorkflowConnection, index) => {
      return (
        <Draggable
          key={`${proposalWorkflowConnection.proposalStatus.id}_${proposalWorkflowConnection.proposalStatus.name}`}
          draggableId={`${proposalWorkflowConnection.proposalStatus.id}_${proposalWorkflowConnection.proposalStatus.name}`}
          index={index}
        >
          {(provided, snapshot) => (
            <Grid
              item
              xs={12}
              data-cy={`connection_${proposalWorkflowConnection.proposalStatus.name}_${proposalWorkflowConnection.proposalStatus.id}`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
              className={classes.item}
            >
              <DialogActions className={classes.dialogActions}>
                <IconButton
                  size="small"
                  className={classes.removeButton}
                  data-cy="remove-workflow-status-button"
                  onClick={() => {
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
              <Box fontSize="1rem">
                {proposalWorkflowConnection.proposalStatus.name}
              </Box>
              <Box fontSize="small" mt={1} color={theme.palette.grey[400]}>
                {proposalWorkflowConnection.proposalStatus.description}
              </Box>
            </Grid>
          )}
        </Draggable>
      );
    });
  };

  const getConnectionGroup = (connectionGroup: any) => {
    return (
      <Droppable
        droppableId={connectionGroup.groupId}
        key={connectionGroup.groupId}
      >
        {(provided, snapshot) => (
          <Grid
            item
            xs={getGridListCols(connectionGroup.numberOfSiblings)}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            className={classes.itemContainer}
          >
            {getConnectionGroupItems(connectionGroup.connections)}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    );
  };

  const connectionGroups = workflowConnectionGroupsWithNumberOfSiblings.map(
    workflowConnectionGroupWithNumberOfSiblings =>
      getConnectionGroup(workflowConnectionGroupWithNumberOfSiblings)
  );

  return (
    <Grid
      container
      className={classes.container}
      data-cy="proposal-workflow-connections"
    >
      <Grid item xs={12} className={classes.title}>
        Proposal workflow
      </Grid>
      {connectionGroups}
    </Grid>
  );
};

export default ProposalWorkflowConnectionsEditor;
