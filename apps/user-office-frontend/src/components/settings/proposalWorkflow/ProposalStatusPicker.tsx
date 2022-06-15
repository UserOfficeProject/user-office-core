import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
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
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const classes = makeStyles((theme) => ({
    container: {
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      flexBasis: '100%',
      height: '100%',
      maxHeight: isExtraLargeScreen ? '1400px' : '850px',
      overflowY: 'auto',
      overflowX: 'hidden',
      backgroundColor: theme.palette.grey[200],
      marginLeft: '5px',
      boxShadow: '5px 7px 9px -5px rgba(0,0,0,0.29)',
    },
    itemContainer: {
      minHeight: '180px',
      overflow: 'auto !important',
    },
    item: {
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
    minWidth: '200px',
    ...draggableStyle,
  });

  const getItems = () =>
    proposalStatuses.map((proposalStatus, index) => (
      <Draggable
        key={`${proposalStatus.shortCode}_${proposalStatus.id}`}
        draggableId={`${proposalStatus.shortCode}_${proposalStatus.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <Grid
            item
            xs={12}
            data-cy={`status_${proposalStatus.shortCode}_${proposalStatus.id}`}
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
            <Box fontSize="small" mt={1} color={theme.palette.grey[800]}>
              {proposalStatus.description}
            </Box>
          </Grid>
        )}
      </Draggable>
    ));

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? theme.palette.primary.light : 'transparent',
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    overflow: 'hidden',
  });

  return (
    <Grid
      container
      className={`${classes.container} tinyScroll`}
      data-cy="proposal-status-picker"
    >
      <Grid item xs={12} className={classes.title}>
        Proposal statuses
      </Grid>
      {proposalStatuses && !!proposalStatuses.length && (
        <Droppable droppableId="proposalStatusPicker">
          {(provided, snapshot) => (
            <Grid
              item
              xs={12}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              className={`${classes.itemContainer} tinyScroll`}
            >
              {getItems()}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      )}
    </Grid>
  );
};

export default ProposalStatusPicker;
