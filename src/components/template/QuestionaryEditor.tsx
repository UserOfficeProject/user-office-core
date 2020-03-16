import {
  Button,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  makeStyles,
  Switch,
  useTheme,
} from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import { ProposalTemplateField } from '../../generated/sdk';
import { usePersistModel } from '../../hooks/usePersistModel';
import QuestionaryEditorModel, {
  EventType,
  Event,
} from '../../models/QuestionaryEditorModel';
import { StyledPaper } from '../../styles/StyledComponents';
import QuestionaryEditorTopic from './QuestionaryEditorTopic';
import QuestionaryFieldEditor from './QuestionaryFieldEditor';

export default function QuestionaryEditor() {
  const { enqueueSnackbar } = useSnackbar();
  const [
    selectedField,
    setSelectedField,
  ] = useState<ProposalTemplateField | null>(null);
  const reducerMiddleware = () => {
    return (next: Function) => (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SERVICE_ERROR_OCCURRED:
          enqueueSnackbar(action.payload, { variant: 'error' });
          break;

        case EventType.FIELD_CREATED:
          setSelectedField(action.payload);
          break;
      }
    };
  };
  const { persistModel, isLoading } = usePersistModel();
  const { state, dispatch } = QuestionaryEditorModel([
    persistModel,
    reducerMiddleware,
  ]);

  const [isTopicReorderMode, setIsTopicReorderMode] = useState(false);

  const theme = useTheme();
  const classes = makeStyles(theme => ({
    modalContainer: {
      backgroundColor: 'white',
    },
    centeredButton: {
      display: 'flex',
      margin: '10px auto',
    },
  }))();

  const getTopicListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    display: 'flex',
  });

  const onDragEnd = (result: DropResult) => {
    if (result.type === 'field') {
      dispatch({
        type: EventType.REORDER_FIELD_REQUESTED,
        payload: { source: result.source, destination: result.destination },
      });
    }
    if (result.type === 'topic') {
      dispatch({
        type: EventType.REORDER_TOPIC_REQUESTED,
        payload: { source: result.source, destination: result.destination },
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
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
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
            payload: { sortOrder: 0 },
          })
        }
      >
        <PlaylistAddIcon />
        &nbsp; Add topic
      </Button>
    ) : null;

  const enableReorderTopicsToggle =
    state.steps.length > 1 ? (
      <FormGroup
        row
        style={{ justifyContent: 'flex-end', paddingBottom: '25px' }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isTopicReorderMode}
              onChange={() => setIsTopicReorderMode(!isTopicReorderMode)}
              color="primary"
            />
          }
          label="Reorder topics mode"
        />
      </FormGroup>
    ) : null;

  return (
    <>
      <StyledPaper style={getContainerStyle(isLoading)}>
        {progressJsx}
        {enableReorderTopicsToggle}
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
                    dragMode={isTopicReorderMode}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {addNewTopicFallbackButton}
      </StyledPaper>

      <QuestionaryFieldEditor
        field={selectedField}
        dispatch={dispatch}
        closeMe={handleFieldEditorClose}
        template={state}
      />
    </>
  );
}
