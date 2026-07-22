import { useState } from 'react';

import { Question, QuestionTemplateRelation, Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';
import { getFieldById } from 'models/questionary/QuestionaryFunctions';
import {
  MiddlewareInputParams,
  ReducerMiddleware,
} from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

/**
 * Owns the TemplateEditor's transient UI selection state (which question /
 * relation / picker / preview is currently open) together with the reducer
 * middleware that drives it. The middleware reacts to editor events and opens
 * the matching drawer/picker, keeping that wiring next to the state it mutates.
 */
export function useTemplateEditorSelection() {
  const [
    selectedQuestionTemplateRelation,
    setSelectedQuestionTemplateRelation,
  ] = useState<QuestionTemplateRelation | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [hoveredDependency, setHoveredDependency] = useState<string>('');
  const [openedPreviewTemplateId, setOpenedPreviewTemplateId] = useState<
    number | null
  >(null);
  const [questionPickerTopicId, setQuestionPickerTopicId] = useState<
    number | null
  >(null);

  const handleEvents: ReducerMiddleware<Template, Event> = ({
    getState,
  }: MiddlewareInputParams<Template, Event>) => {
    return (next: FunctionType) => (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.QUESTION_CREATED:
          setSelectedQuestion(action.payload);
          break;

        case EventType.PICK_QUESTION_REQUESTED:
          setQuestionPickerTopicId(action.payload.topic.id);
          break;

        case EventType.OPEN_QUESTION_EDITOR:
          setSelectedQuestion(action.payload);
          break;

        case EventType.OPEN_QUESTIONREL_EDITOR: {
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
        }

        case EventType.QUESTION_PICKER_NEW_QUESTION_CLICKED:
          setQuestionPickerTopicId(action.payload.topic.id);
          break;

        case EventType.DEPENDENCY_HOVER:
          setHoveredDependency(action.payload.dependency);
          break;
      }
    };
  };

  return {
    selectedQuestionTemplateRelation,
    setSelectedQuestionTemplateRelation,
    selectedQuestion,
    setSelectedQuestion,
    hoveredDependency,
    openedPreviewTemplateId,
    setOpenedPreviewTemplateId,
    questionPickerTopicId,
    setQuestionPickerTopicId,
    handleEvents,
  };
}
