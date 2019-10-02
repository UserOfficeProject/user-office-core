import { Droppable, Draggable } from "react-beautiful-dnd";
import React from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic } from "../model/ProposalModel";
import { makeStyles, Grid, useTheme } from "@material-ui/core";

export default function QuestionaryEditorTopic(props: {
  data: Topic;
  dispatch: Function;
  index: number;
}) {
  const { data, dispatch, index } = props;

  const theme = useTheme();

  const classes = makeStyles(theme => ({
    container: {
      alignItems: "flex-start",
      alignContent: "flex-start",
      background: "#FFF"
    },
    itemContainer: {
      minHeight: "180px"
    },
    topic: {
      fontSize: "13px",
      padding: "0 5px",
      marginBottom: "15px",
      textTransform: "uppercase",
      color: theme.palette.grey[600],
      fontWeight: 600,
      background:"white"
    }
  }))();

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)"
  });

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    background:"#FFF",
    ...draggableStyle
  });

  return (
    <Draggable
      key={data.topic_id.toString()}
      draggableId={data.topic_id.toString()}
      index={index}
    >
      {(provided, snapshotDraggable) => (
        <Grid container className={classes.container}
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={getItemStyle(
            snapshotDraggable.isDragging,
            provided.draggableProps.style
          )}
        >
          <Grid item xs={12} className={classes.topic}
            {...provided.dragHandleProps}
          >
            {data.topic_title}
          </Grid>

          <Droppable droppableId={data.topic_id.toString()} type="field">
            {(provided, snapshot) => (
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
            )}
          </Droppable>
        </Grid>
      )}
    </Draggable>
  );
}
