import { Droppable } from '@hello-pangea/dnd';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import React from 'react';

import { Call } from 'generated/sdk';

import DraggableListItem from './CallListItem';

export default function CallReorder(props: {
  items: Call[];
  onDragEnd: OnDragEndResponder;
}) {
  return (
    <DragDropContext onDragEnd={props.onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {props.items.map((item, index) => (
              <DraggableListItem item={item} index={index} key={item.id} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
