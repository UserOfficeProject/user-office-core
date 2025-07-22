import { Draggable } from '@hello-pangea/dnd';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import { Call } from 'generated/sdk';

export type CallListDragItemProps = {
  item: Call;
  index: number;
};

export default function CallListDragItem({
  item,
  index,
}: CallListDragItemProps) {
  return (
    <Draggable draggableId={item.id.toString()} index={index}>
      {(provided) => (
        <ListItem
          data-cy={'call-list-drag-item'}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItemText primary={item.shortCode} secondary={item.description} />
        </ListItem>
      )}
    </Draggable>
  );
}
