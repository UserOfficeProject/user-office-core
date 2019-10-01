import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import { Draggable } from "react-beautiful-dnd";
import React, { useState } from "react";
import { makeStyles, Grid, useTheme } from "@material-ui/core";
import ShortTextIcon from "@material-ui/icons/ShortText";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import TextFieldsIcon from "@material-ui/icons/TextFields";

export default function QuestionaryEditorTopicItem(props: {
  data: ProposalTemplateField;
  dispatch: Function;
  index: number;
}) {

  const theme = useTheme();
  
  const classes = makeStyles(theme => ({
    container: {
      fontSize: "13px",
      padding: "0 5px",
      textTransform: "uppercase",
      fontWeight: 600,

    },
    icon: {
      color: theme.palette.grey[400]
    },
    question: {
      color: "#000"
    }
  }))();

  const [isHover, setIsHover] = useState<boolean>(false);
  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    userSelect: "none",
    padding: "12px 8px 8px 8px",
    marginBottom: "4px",
    background: isDragging ? theme.palette.grey[200] : isHover ? theme.palette.grey[100] : "white",
    opacity: isDragging ? 0.5 : 1,
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    boxShadow: "0px 1px 2px 0px rgba(163,163,163,0.66)",
    ...draggableStyle
  });

  const getIcon = (dataType: DataType) => {
    switch (dataType) {
      case DataType.TEXT_INPUT:
        return <ShortTextIcon />;
      case DataType.BOOLEAN:
        return <CheckBoxOutlineBlankIcon />;
      case DataType.DATE:
        return <CalendarTodayIcon />;
      case DataType.FILE_UPLOAD:
        return <AttachFileIcon />;
      case DataType.EMBELLISHMENT:
        return <TextFieldsIcon />;
      case DataType.BOOLEAN:
        return <RadioButtonCheckedIcon />;
      default:
        return null;
    }
  };

  return (
    <Draggable
      key={props.data.proposal_question_id}
      draggableId={props.data.proposal_question_id}
      index={props.index}
    >
      {(provided, snapshot) => (
        <Grid
          container
          spacing={1}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <Grid item xs={12} className={classes.question}>
            {props.data.question}
          </Grid>
          <Grid item xs={1} className={classes.icon}>
            {getIcon(props.data.data_type)}
          </Grid>
          <Grid item xs={11}></Grid>
        </Grid>
      )}
    </Draggable>
  );
}
