import { ProposalTemplateField } from "../model/ProposalModel";
import { Draggable } from "react-beautiful-dnd";
import React from "react";

export default function QuestionaryEditorTopicItem(props: {
  data: ProposalTemplateField;
  dispatch: Function;
  index: number;
}) {
  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    userSelect: "none",
    padding: "6px",
    border: "1px solid #ddd",
    margin: `0 0 3px 0`,
    background: isDragging ? "lightgrey" : "white",
    opacity: isDragging ? 0.5 : 1,
    ...draggableStyle
  });

  return (
    <Draggable
      key={props.data.proposal_question_id}
      draggableId={props.data.proposal_question_id}
      index={props.index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          {props.data.question}
        </div>
      )}
    </Draggable>
  );
}
