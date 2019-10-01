import { Droppable } from "react-beautiful-dnd";
import React from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic } from "../model/ProposalModel";

export default function QuestionaryEditorTopic(props:{data:Topic, dispatch:Function}) {
    const {data, dispatch } = props;

    const getListStyle = (isDraggingOver: any) => ({
        background: isDraggingOver ? "#c4dbff" : "#f4f5f7",
        border: isDraggingOver ? "1px dashed #7fadf5" : "1px solid grey",
        padding: "6px",
        width: 250
      });
    return (
        <Droppable droppableId={data.topic_id.toString()}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                <p>{data.topic_title}</p>
                {data.fields.map((item, index) => (
                  <QuestionaryEditorTopicItem
                  index={index}
                  data={item}
                  dispatch={dispatch}
                   />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
    )
}