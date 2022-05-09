import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import {
  Question,
  QuestionaryStep,
  QuestionTemplateRelation,
  Template,
} from 'generated/sdk';
import { usePersistQuestionaryEditorModel } from 'hooks/questionary/usePersistQuestionaryEditorModel';
import QuestionaryEditorModel, {
  Event,
  EventType,
} from 'models/questionary/QuestionaryEditorModel';
import {
  getFieldById,
  getQuestionaryStepByTopicId,
} from 'models/questionary/QuestionaryFunctions';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import QuestionEditor from './QuestionEditor';
import { QuestionPicker } from './QuestionPicker';
import QuestionTemplateRelationEditor from './QuestionTemplateRelationEditor';
import { TemplateMetadataEditor } from './TemplateMetadataEditor';
import QuestionaryEditorTopic from './TemplateTopicEditor';

const useStyles = makeStyles(() => ({
  modalContainer: {
    backgroundColor: 'white',
  },
  centeredButton: {
    display: 'flex',
    margin: '10px auto',
  },
}));
export default function TemplateEditor() {
  const { api } = useDataApiWithFeedback();
  const [
    selectedQuestionTemplateRelation,
    setSelectedQuestionTemplateRelation,
  ] = useState<QuestionTemplateRelation | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  const [hoveredDependency, setHoveredDependency] = useState<string>('');

  const [questionPickerTopicId, setQuestionPickerTopicId] = useState<
    number | null
  >(null);
  const handleEvents = ({
    getState,
  }: MiddlewareInputParams<Template, Event>) => {
    return (next: FunctionType) => (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SERVICE_ERROR_OCCURRED:
          break;

        case EventType.QUESTION_CREATED:
          setSelectedQuestion(action.payload);
          break;

        case EventType.PICK_QUESTION_REQUESTED:
          setQuestionPickerTopicId(action.payload.topic.id);
          break;

        case EventType.OPEN_QUESTION_EDITOR:
          setSelectedQuestion(action.payload);
          break;

        case EventType.OPEN_QUESTIONREL_EDITOR:
          const templateRelation = getFieldById(
            getState().steps,
            action.payload.questionId
          );
          if (!templateRelation) {
            return;
          }

          setSelectedQuestionTemplateRelation(
            templateRelation as QuestionTemplateRelation
          );
          break;

        case EventType.QUESTION_PICKER_NEW_QUESTION_CLICKED:
          setQuestionPickerTopicId(action.payload.topic.id);
          break;
        case EventType.DEPENDENCY_HOVER:
          setHoveredDependency(action.payload.dependency);
          break;
      }
    };
  };
  const { persistModel, isLoading } = usePersistQuestionaryEditorModel();
  const { state, dispatch } = QuestionaryEditorModel([
    persistModel,
    handleEvents,
  ]);

  const [isTopicReorderMode, setIsTopicReorderMode] = useState(false);

  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const classes = useStyles();

  const getTopicListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    display: 'flex',
    overflow: 'auto',
    maxHeight: isExtraLargeScreen ? '1400px' : '700px',
  });

  const onDragEnd = (result: DropResult): void => {
    const dragSource = result.source;
    const dragDestination = result.destination;

    if (
      !dragDestination ||
      (dragDestination.droppableId === dragSource.droppableId &&
        dragDestination.index === dragSource.index)
    ) {
      return;
    }

    const isDraggingQuestion = result.type === 'field';
    const isDraggingTopic = result.type === 'topic';

    if (isDraggingQuestion) {
      const isDraggingFromQuestionDrawerToTopic =
        dragSource.droppableId === 'questionPicker' &&
        dragDestination.droppableId !== 'questionPicker';
      const isDraggingFromTopicToQuestionDrawer =
        dragDestination.droppableId === 'questionPicker' &&
        dragSource.droppableId !== 'questionPicker';
      const isReorderingInsideTopics =
        dragDestination.droppableId !== 'questionPicker' &&
        dragSource.droppableId !== 'questionPicker';

      if (isDraggingFromQuestionDrawerToTopic) {
        const questionId = result.draggableId;
        const topicId = dragDestination.droppableId
          ? +dragDestination.droppableId
          : undefined;

        const sortOrder = dragDestination.index;

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
      } else if (isDraggingFromTopicToQuestionDrawer) {
        const topicId = parseInt(dragSource.droppableId);
        const step = getQuestionaryStepByTopicId(
          state.steps,
          topicId
        ) as QuestionaryStep;
        const question = step.fields[dragSource.index].question;
        api()
          .deleteQuestionTemplateRelation({
            templateId: state.templateId,
            questionId: question.id,
          })
          .then((data) => {
            if (data.deleteQuestionTemplateRelation.template) {
              dispatch({
                type: EventType.QUESTION_REL_UPDATED,
                payload: data.deleteQuestionTemplateRelation.template,
              });
            }
          });
      } else if (isReorderingInsideTopics) {
        dispatch({
          type: EventType.REORDER_QUESTION_REL_REQUESTED,
          payload: {
            source: dragSource,
            destination: dragDestination,
          },
        });
      }
    }
    if (isDraggingTopic) {
      dispatch({
        type: EventType.REORDER_TOPIC_REQUESTED,
        payload: { source: dragSource, destination: dragDestination },
      });
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    return isLoading || state.templateId === 0
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
        className={classes.centeredButton}
        onClick={(): void =>
          dispatch({
            type: EventType.CREATE_TOPIC_REQUESTED,
            payload: { isFirstTopic: true },
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
            />
          }
          label="Reorder topics mode"
        />
      </FormGroup>
    ) : null;

  return (
    <StyledContainer maxWidth={false}>
      <TemplateMetadataEditor dispatch={dispatch} template={state} />
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
                className="tinyScroll"
              >
                {state.steps.map((step, index) => {
                  const questionPicker =
                    step.topic.id === questionPickerTopicId ? (
                      <QuestionPicker
                        topic={step.topic}
                        dispatch={dispatch}
                        template={state}
                        closeMe={() => {
                          setQuestionPickerTopicId(null);
                        }}
                        id="questionPicker"
                      />
                    ) : null;

                  return (
                    <React.Fragment key={step.topic.id}>
                      <QuestionaryEditorTopic
                        data={step}
                        dispatch={dispatch}
                        index={index}
                        dragMode={isTopicReorderMode}
                        hoveredDependency={hoveredDependency}
                      />
                      {questionPicker}
                    </React.Fragment>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {newTopicFallbackButton}
      </StyledPaper>

      <QuestionTemplateRelationEditor
        field={selectedQuestionTemplateRelation}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestionTemplateRelation(null)}
        template={state}
      />

      <QuestionEditor
        field={selectedQuestion}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestion(null)}
        template={state}
      />
    </StyledContainer>
  );
}
