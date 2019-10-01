import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import QuestionaryEditorTopic from "./QuestionaryEditorTopic";
import QuestionaryEditorModel, { ActionType } from "./QuestionaryEditorModel";

export default function QuestionaryEditor() {
  var { state, dispatch } = QuestionaryEditorModel();
  const onDragEnd = (result: DropResult) => {
    dispatch({
      type: ActionType.MOVE_ITEM,
      payload: { source: result.source, destination: result.destination }
    });
  };

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex" }}>
        {state.topics.map(topic => (
          <QuestionaryEditorTopic data={topic} dispatch={dispatch} />
        ))}
      </div>
    </DragDropContext>
  );
}
