import React, { useState } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import QuestionaryEditorTopic from "./QuestionaryEditorTopic";
import QuestionaryEditorModel, {
  EventType,
  IEvent
} from "../models/QuestionaryEditorModel";
import {
  Paper,
  makeStyles,
  useTheme,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  LinearProgress
} from "@material-ui/core";
import { usePersistModel } from "../hooks/usePersistModel";
import { ProposalTemplateField } from "../models/ProposalModel";
import QuestionaryFieldEditor from "./QuestionaryFieldEditor";
import Notification from "./Notification";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";

export default function QuestionaryEditor() {
  const reducerMiddleware = () => {
    return (next: Function) => (action: IEvent) => {
      next(action);
      switch (action.type) {
        case EventType.SERVICE_ERROR_OCCURRED:
          setErrorState({ ...errorState, open: true, message: action.payload });
          break;

        case EventType.FIELD_CREATED:
          setSelectedField(action.payload);
          break;
      }
    };
  };

  var { persistModel, isLoading } = usePersistModel();
  var { state, dispatch } = QuestionaryEditorModel([
    persistModel,
    reducerMiddleware
  ]);
  const [errorState, setErrorState] = useState({
    open: false,
    message: "",
    variant: "error"
  });

  const [isTopicReorderMode, setIsTopicReorderMode] = useState(false);

  const [
    selectedField,
    setSelectedField
  ] = React.useState<ProposalTemplateField | null>(null);

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
    },
    modalContainer: {
      backgroundColor: "white"
    },
    centeredButton: {
      display: "flex",
      margin: "10px auto"
    }
  }))();

  const getTopicListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    display: "flex"
  });

  const onDragEnd = (result: DropResult) => {
    if (result.type === "field") {
      dispatch({
        type: EventType.REORDER_FIELD_REQUESTED,
        payload: { source: result.source, destination: result.destination }
      });
    }
    if (result.type === "topic") {
      dispatch({
        type: EventType.REORDER_TOPIC_REQUESTED,
        payload: { source: result.source, destination: result.destination }
      });
    }
  };

  const onClick = (data: ProposalTemplateField) => {
    setSelectedField(data);
  };

  const handleFieldEditorClose = () => {
    setSelectedField(null);
  };

  const getContainerStyle = (isBusy: boolean): any => {
    return isLoading
      ? {
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.5
        }
      : {};
  };

  const progressJsx = isLoading ? <LinearProgress /> : null;

  const addNewTopicFallbackButton =
    state.steps.length === 0 ? (
      <Button
        variant="outlined"
        color="primary"
        className={classes.centeredButton}
        onClick={() =>
          dispatch({
            type: EventType.CREATE_TOPIC_REQUESTED,
            payload: { sortOrder: 0 }
          })
        }
      >
        <PlaylistAddIcon />
        &nbsp; Add topic
      </Button>
    ) : null;
  return (
    <>
      <Notification
        open={errorState.open}
        onClose={() => {
          setErrorState({ ...errorState, open: false });
        }}
        variant={errorState.variant}
        message={errorState.message}
      />
      <Paper className={classes.paper} style={getContainerStyle(isLoading)}>
        {progressJsx}
        <FormGroup row style={{ justifyContent: "flex-end" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isTopicReorderMode}
                onChange={() => setIsTopicReorderMode(!isTopicReorderMode)}
                color="primary"
              />
            }
            label="Enable reordering topics"
          />
        </FormGroup>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="topics" direction="horizontal" type="topic">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getTopicListStyle(snapshot.isDraggingOver)}
              >
                {state.steps.map((step, index) => (
                  <QuestionaryEditorTopic
                    data={step}
                    dispatch={dispatch}
                    index={index}
                    key={step.topic.topic_id}
                    onItemClick={onClick}
                    condenseMode={isTopicReorderMode}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {addNewTopicFallbackButton}
      </Paper>

      <QuestionaryFieldEditor
        field={selectedField}
        dispatch={dispatch}
        closeMe={handleFieldEditorClose}
        template={state}
      />
    </>
  );
}
