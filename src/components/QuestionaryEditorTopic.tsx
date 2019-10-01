import { Droppable } from "react-beautiful-dnd";
import React from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic } from "../model/ProposalModel";
import { makeStyles, Grid, useTheme } from "@material-ui/core";


export default function QuestionaryEditorTopic(props: {
  data: Topic;
  dispatch: Function;
}) {
  

  const { data, dispatch } = props;

  const theme = useTheme();
  
  const classes = makeStyles(theme => ({
    container: {
      alignItems: "flex-start",
      alignContent: "flex-start"
    },
    itemContainer: {
      minHeight: "180px"
    },
    topic: {
      fontSize: "13px",
      padding: "0 5px",
      marginBottom: "5px",
      textTransform: "uppercase",
      color: theme.palette.grey[600],
      fontWeight: 600
    }
  }))();
  
  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver ? theme.palette.primary.light : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)"
  });

  return (
    <Droppable droppableId={data.topic_id.toString()}>
      {(provided, snapshot) => (
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className={classes.container}
        >
          <Grid item xs={12} className={classes.topic}>
            {data.topic_title}
          </Grid>
          <Grid
            item
            xs={12}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            className={classes.itemContainer}
          >
            {data.fields.map((item, index) => (
              <QuestionaryEditorTopicItem
                index={index}
                data={item}
                dispatch={dispatch}
              />
            ))}
            {provided.placeholder}
          </Grid>
        </Grid>
      )}
    </Droppable>
  );
}
