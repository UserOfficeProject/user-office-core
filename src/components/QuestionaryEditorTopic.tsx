import { Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState } from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic } from "../model/ProposalModel";
import { makeStyles, Grid, useTheme, TextField } from "@material-ui/core";
import { ActionType } from "./QuestionaryEditorModel";

export default function QuestionaryEditorTopic(props: {
  data: Topic;
  dispatch: Function;
  index: number;
}) {
  const { data, dispatch, index } = props;
  const [title, setTitle] = useState<string>(data.topic_title);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const theme = useTheme();

  const classes = makeStyles(theme => ({
    container: {
      alignItems: "flex-start",
      alignContent: "flex-start",
      background: "#FFF",
      flexBasis: "100%"
    },
    inputHeading: {
      fontSize: "13px",
      color: theme.palette.grey[600],
      fontWeight: 600,
      textTransform: "uppercase",
      width: "100%"
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
      background: "white"
    }
  }))();

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)"
  });

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    background: "#FFF",
    ...draggableStyle
  });

  const titleJsx = isEditMode ? (
    <input
      type="text"
      value={title}
      className={classes.inputHeading}
      onChange={event => setTitle(event.target.value)}
      onBlur={() => {
        setIsEditMode(false);
        dispatch({ type:ActionType.UPDATE_TOPIC, payload:{ topicId:data.topic_title, title:title } })
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  ) : (
    <span
      onClick={() => {
        setIsEditMode(true);
      }}
    >
      {title}
    </span>
  );
  return (
    <Draggable
      key={data.topic_id.toString()}
      draggableId={data.topic_id.toString()}
      index={index}
    >
      {(provided, snapshotDraggable) => (
        <Grid
          container
          className={classes.container}
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={getItemStyle(
            snapshotDraggable.isDragging,
            provided.draggableProps.style
          )}
        >
          <Grid
            item
            xs={12}
            className={classes.topic}
            {...provided.dragHandleProps}
          >
            {titleJsx}
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
