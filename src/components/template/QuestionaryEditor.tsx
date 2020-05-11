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

import { QuestionRel, Question } from '../../generated/sdk';
import { usePersistModel } from '../../hooks/usePersistModel';
import QuestionaryEditorModel, {
  Event,
  EventType,
} from '../../models/QuestionaryEditorModel';
import { StyledPaper } from '../../styles/StyledComponents';
import QuestionEditor from './forms/QuestionEditor';
import QuestionRelEditor from './forms/QuestionRelEditor';
import QuestionaryEditorTopic from './QuestionaryEditorTopic';
import { QuestionPicker } from './QuestionPicker';

export default function QuestionaryEditor() {
  const { enqueueSnackbar } = useSnackbar();
  const [
    selectedQuestionRel,
    setSelectedQuestionRel,
  ] = useState<QuestionRel | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [questionPickerTopicId, setQuestionPickerTopicId] = useState<
    number | null
  >(null);
  const reducerMiddleware = () => {
    return (next: Function) => (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SERVICE_ERROR_OCCURRED:
          enqueueSnackbar(action.payload, { variant: 'error' });
          break;

        case EventType.QUESTION_CREATED:
          setSelectedQuestion(action.payload);
          break;

        case EventType.PICK_QUESTION_REQUESTED:
          setQuestionPickerTopicId(action.payload.topic.id);
          break;

        case EventType.QUESTION_PICKER_NEW_QUESTION_CLICKED:
          // TODO open question edit modal window
          //setQuestionPickerTopicId(action.payload.topic.id);
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
  const classes = makeStyles(() => ({
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

  const onDragEnd = (result: DropResult): void => {
    if (result.type === 'field') {
      const dragSource = result.source;
      const dragDestination = result.destination;
      if (result.source.droppableId === 'questionPicker') {
        const questionId =
          state.complementaryQuestions[dragSource.index].proposalQuestionId;
        const topicId = dragDestination?.droppableId
          ? +dragDestination.droppableId
          : undefined;
        const sortOrder = dragDestination?.index;
        if (topicId && questionId) {
          dispatch({
            type: EventType.CREATE_QUESTION_REL_REQUESTED,
            payload: {
              topicId,
              questionId,
              sortOrder,
              templateId: state.templateId,
            },
          });
        }
      } else {
        dispatch({
          type: EventType.REORDER_QUESTION_REL_REQUESTED,
          payload: { source: result.source, destination: result.destination },
        });
      }
    }
    if (result.type === 'topic') {
      dispatch({
        type: EventType.REORDER_TOPIC_REQUESTED,
        payload: { source: result.source, destination: result.destination },
      });
    }
  };

  const onQuestionRelClick = (data: QuestionRel): void => {
    setSelectedQuestionRel(data);
  };

  const getContainerStyle = (): any => {
    return isLoading
      ? {
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
        }
      : {};
  };

  const progressJsx = isLoading ? <LinearProgress /> : null;
  const newTopicFallbackButton =
    state.steps.length === 0 ? (
      <Button
        variant="outlined"
        color="primary"
        className={classes.centeredButton}
        onClick={(): void =>
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
              onChange={(): void => setIsTopicReorderMode(!isTopicReorderMode)}
              color="primary"
            />
          }
          label="Reorder topics mode"
        />
      </FormGroup>
    ) : null;

  return (
    <>
      <StyledPaper style={getContainerStyle()}>
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
                {state.steps.map((step, index) => {
                  const questionPicker =
                    step.topic.id === questionPickerTopicId ? (
                      <QuestionPicker
                        dispatch={dispatch}
                        template={state}
                        key="questionPicker"
                        closeMe={() => {
                          setQuestionPickerTopicId(null);
                        }}
                        onItemClick={(data: Question) =>
                          setSelectedQuestion(data)
                        }
                        id="questionPicker"
                      />
                    ) : null;

                  return (
                    <>
                      <QuestionaryEditorTopic
                        data={step}
                        dispatch={dispatch}
                        index={index}
                        key={step.topic.id}
                        onItemClick={onQuestionRelClick}
                        dragMode={isTopicReorderMode}
                      />
                      {questionPicker}
                    </>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {newTopicFallbackButton}
      </StyledPaper>

      <QuestionRelEditor
        field={selectedQuestionRel}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestionRel(null)}
        template={state}
      />

      <QuestionEditor
        field={selectedQuestion}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestion(null)}
        template={state}
      />
    </>
  );
}
