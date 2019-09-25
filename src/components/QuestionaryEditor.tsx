import React from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { DragDropContext, DropResult, ResponderProvided } from "react-beautiful-dnd";

export default function QuestionaryEditor(props: {}) {
  const classes = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4)
    },
    paper: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3)
      }
    }
  }))();

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <DragDropContext
                onDragEnd={(result:DropResult, provided:ResponderProvided) => {}}></DragDropContext>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export const ItemTypes = {
  QUESTION: "question"
};
