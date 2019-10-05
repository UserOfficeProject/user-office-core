import { Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState } from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic, ProposalTemplateField } from "../model/ProposalModel";
import { makeStyles, Grid, useTheme } from "@material-ui/core";
import { ActionType } from "./QuestionaryEditorModel";

export default function QuestionaryEditorTopic(props: {
  data: Topic;
  dispatch: Function;
  index: number;
  onItemClick: {(data:ProposalTemplateField):void}
}) {

  const theme = useTheme();

  const classes = makeStyles(theme => ({
    container: {
      alignItems: "flex-start",
      alignContent: "flex-start",
      background: "#FFF",
      flexBasis: "100%"
    },
    inputHeading: {
      fontSize: "15px",
      color: theme.palette.grey[600],
      fontWeight: 600,
      width: "100%"
    },
    itemContainer: {
      minHeight: "180px"
    },
    topic: {
      fontSize: "15px",
      padding: "0 5px",
      marginBottom: "16px",
      color: theme.palette.grey[600],
      fontWeight: 600,
      background: "white"
    }
  }))();

  const { data, dispatch, index } = props;
  const [title, setTitle] = useState<string>(data.topic_title);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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
        dispatch({ type:ActionType.UPDATE_TOPIC_TITLE, payload:{ topicId:data.topic_id, title:title } })
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
      {props.data.topic_title}
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
                    onClick={props.onItemClick}
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
