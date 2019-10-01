import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import QuestionaryEditorTopic from "./QuestionaryEditorTopic";
import QuestionaryEditorModel, { ActionType } from "./QuestionaryEditorModel";
import { Container, Grid, Paper, makeStyles } from "@material-ui/core";

export default function QuestionaryEditor() {
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
    <Paper className={classes.paper}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex" }}>
          {state.topics.map(topic => (
            <QuestionaryEditorTopic data={topic} dispatch={dispatch} />
          ))}
        </div>
      </DragDropContext>
    </Paper>
  );
}
