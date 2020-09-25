import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import React from 'react';
import {
  Draggable,
  DraggingStyle,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import { ProposalStatus } from 'generated/sdk';

const ProposalStatusPicker: React.FC<{
  proposalStatuses: ProposalStatus[];
}> = ({ proposalStatuses }) => {
  const theme = useTheme();
  const classes = makeStyles(theme => ({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      flexBasis: '100%',
      backgroundColor: theme.palette.grey[200],
      boxShadow: '5px 7px 9px -5px rgba(0,0,0,0.29)',
    },
    itemContainer: {
      minHeight: '180px',
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

  const getItems = () =>
    proposalStatuses.map((proposalStatus, index) => (
      <Draggable
        key={`${proposalStatus.name}_${proposalStatus.id}`}
        draggableId={`${proposalStatus.name}_${proposalStatus.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <Grid
            item
            xs={12}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
            className={classes.item}
          >
            <Box fontSize="1rem">{proposalStatus.name}</Box>
            <Box fontSize="small" mt={1} color={theme.palette.grey[400]}>
              {proposalStatus.description}
            </Box>
          </Grid>
        )}
      </Draggable>
    ));

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? theme.palette.primary.light : 'transparent',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  });

  return (
    <Grid
      container
      className={classes.container}
      data-cy="proposal-status-picker"
    >
      <Grid item xs={12} className={classes.title}>
        Proposal statuses
      </Grid>
      <Droppable droppableId="proposalStatusPicker">
        {(provided, snapshot) => (
          <Grid
            item
            xs={12}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            className={classes.itemContainer}
          >
            {getItems()}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    </Grid>
  );
};

export default ProposalStatusPicker;
