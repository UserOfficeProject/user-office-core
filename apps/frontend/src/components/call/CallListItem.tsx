import { Draggable } from '@hello-pangea/dnd';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Call } from 'generated/sdk';

export type DraggableListItemProps = {
  item: Call;
  index: number;
};

export default function DraggableListItem({
  item,
  index,
}: DraggableListItemProps) {
  const theme = useTheme();

  return (
    <Draggable draggableId={item.id.toString()} index={index}>
      {(provided, snapshot) => (
        <ListItem
          data-cy={'drag-item'}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? 'background : rgb(235,235,235)' : ''}
          sx={{
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            background: '#FFF',
            flexBasis: '100%',
            height: '100%',
            minWidth: '220px',
            overflow: 'hidden',
            ...(provided.dragHandleProps?.draggable && {
              borderColor: theme.palette.grey[400],
              padding: '5px',
              borderWidth: '1px',
              borderStyle: 'dashed',
            }),
          }}
        >
          <ListItemText primary={item.shortCode} secondary={item.description} />
        </ListItem>
      )}
    </Draggable>
  );
}
