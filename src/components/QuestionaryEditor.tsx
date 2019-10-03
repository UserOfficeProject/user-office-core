import React from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import QuestionaryEditorTopic from "./QuestionaryEditorTopic";
import QuestionaryEditorModel, { ActionType } from "./QuestionaryEditorModel";
import { Paper, makeStyles, useTheme } from "@material-ui/core";
import { usePersistModel } from "../hooks/usePersistModel";


export default function QuestionaryEditor() {

  var {persistModel, isLoading} = usePersistModel();
  var { state, dispatch } = QuestionaryEditorModel([persistModel]);

  const theme = useTheme();
  const classes = makeStyles(theme => ({
    paper: {
      margin: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3)
      }
    }
  }))();

  const getTopicListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    display:"flex"
  });

  const onDragEnd = (result: DropResult) => {
    if(result.type === "field") {
      dispatch({
        type: ActionType.MOVE_ITEM,
        payload: { source: result.source, destination: result.destination }
      });
    }
  };

  return (
    <Paper className={classes.paper}>
      {isLoading}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="topics" direction="horizontal" type="topic">
        {(provided, snapshot) => (
          <div
          {...provided.droppableProps}
          ref={provided.innerRef} 
          style={getTopicListStyle(snapshot.isDraggingOver)}>
          {state!.topics.map((topic, index) => (
            <QuestionaryEditorTopic
              data={topic}
              dispatch={dispatch}
              index={index}
            />
          ))}
          {provided.placeholder}
          </div>
        )}
        </Droppable>
      </DragDropContext>
    </Paper>
  );
}
