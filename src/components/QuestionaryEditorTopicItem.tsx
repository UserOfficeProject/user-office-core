import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { makeStyles, Grid, useTheme } from "@material-ui/core";
import ShortTextIcon from "@material-ui/icons/ShortText";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import LockIcon from "@material-ui/icons/Lock";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import { IEvent } from "./QuestionaryEditorModel";

export default function QuestionaryEditorTopicItem(props: {
  data: ProposalTemplateField;
  dispatch: React.Dispatch<IEvent>;
  index: number;
  onClick: {(data:ProposalTemplateField):void}
}) {
  const theme = useTheme();
  const classes = makeStyles(theme => ({
    icon: {
      color: theme.palette.grey[400],
      justifyItems: "flex-end",
      justifyContent: "flex-end",
      display: "flex"
    },
    question: {
      color: "#000",
      fontSize:"15px",
      padding: "6px 0"
    },
    questionId: {
      fontSize: "12px",
      fontWeight: "bold",
      color: theme.palette.grey[400]
    },
    dependencies: {
      fontSize: "12px",
      color: theme.palette.grey[400],
      display:"flex",
      padding:"10px 0 5px 0",
      justifyContent:"flex-end",
      alignItems:"center",
      '& ul': {
        display:"inline-block",
        padding:"0",
        margin:"0",
        '& li': {
          display: "inline",
          marginLeft: "3px",
          listStyle: "none"
        }
      }
    },
    lockIcon: {
      fontSize:"17px"
    }
  }))();

  const [isHover, setIsHover] = useState<boolean>(false);

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    display: "flex",
    padding: "12px 8px 8px 8px",
    marginBottom: "4px",
    backgroundColor: isDragging
      ? theme.palette.grey[200]
      : isHover
      ? theme.palette.grey[100]
      : "white",
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    boxShadow: "0px 1px 2px 0px rgba(163,163,163,0.66)",
    maxWidth: "100%",
    ...draggableStyle
  });

  const getIcon = (dataType: DataType) => {
    switch (dataType) {
      case DataType.TEXT_INPUT:
        return <ShortTextIcon />;
      case DataType.SELECTION_FROM_OPTIONS:
        return <RadioButtonCheckedIcon />;
      case DataType.BOOLEAN:
        return <CheckBoxOutlineBlankIcon />;
      case DataType.DATE:
        return <CalendarTodayIcon />;
      case DataType.FILE_UPLOAD:
        return <AttachFileIcon />;
      case DataType.EMBELLISHMENT:
        return <TextFieldsIcon />;

      default:
        return null;
    }
  };

  const sanitizeEmbellishment = (input: string | undefined) => {
    if (!input) {
      return "<No content>";
    }
    return input.replace(/<[^>]+>/g, "");
  };

  const dependencies = props.data.dependencies;
  const dependenciesJsx =
    dependencies && dependencies.length > 0 ? (
      <>
        <LockIcon className={classes.lockIcon} />
        <ul>
          {dependencies.map(dep => {
            return <li key={dep.proposal_question_id + dep.proposal_question_dependency}>{dep.proposal_question_dependency}</li>;
          })}
        </ul>
      </>
    ) : null;

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
          onClick={() => {props.onClick(props.data)}}
        >
          <Grid item xs={10} className={classes.questionId}>
            {props.data.proposal_question_id}
          </Grid>
          <Grid item xs={2} className={classes.icon}>
            {getIcon(props.data.data_type)}
          </Grid>

          <Grid item xs={10} className={classes.question}>
            {props.data.data_type === DataType.EMBELLISHMENT
              ? sanitizeEmbellishment(props.data.config.html)
              : props.data.question}
          </Grid>
          
          <Grid item xs={12} className={classes.dependencies}>
            {dependenciesJsx}
          </Grid>
        </Grid>
      )}
    </Draggable>
  );
}
