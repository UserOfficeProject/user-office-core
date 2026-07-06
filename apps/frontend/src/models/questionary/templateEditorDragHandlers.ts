import { DraggableLocation, DropResult } from '@hello-pangea/dnd';
import React from 'react';

import { QuestionaryStep, Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';
import { getQuestionaryStepByTopicId } from 'models/questionary/QuestionaryFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const QUESTION_PICKER_DROPPABLE_ID = 'questionPicker';

type DataApi = ReturnType<typeof useDataApiWithFeedback>['api'];

export interface TemplateDragHandlerDeps {
  state: Template;
  dispatch: React.Dispatch<Event>;
  api: DataApi;
}

const isSamePosition = (
  source: DraggableLocation,
  destination: DraggableLocation
): boolean =>
  destination.droppableId === source.droppableId &&
  destination.index === source.index;

const isPicker = (location: DraggableLocation): boolean =>
  location.droppableId === QUESTION_PICKER_DROPPABLE_ID;

const addQuestionToTopic = (
  result: DropResult,
  destination: DraggableLocation,
  { state, dispatch }: TemplateDragHandlerDeps
): void => {
  const questionId = result.draggableId;
  const topicId = destination.droppableId
    ? +destination.droppableId
    : undefined;
  const sortOrder = destination.index;

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
};

const removeQuestionFromTopic = (
  source: DraggableLocation,
  { state, dispatch, api }: TemplateDragHandlerDeps
): void => {
  const topicId = parseInt(source.droppableId);
  const step = getQuestionaryStepByTopicId(
    state.steps,
    topicId
  ) as QuestionaryStep;
  const question = step.fields[source.index].question;

  api()
    .deleteQuestionTemplateRelation({
      templateId: state.templateId,
      questionId: question.id,
    })
    .then((data) => {
      if (data.deleteQuestionTemplateRelation) {
        dispatch({
          type: EventType.QUESTION_REL_UPDATED,
          payload: data.deleteQuestionTemplateRelation,
        });
      }
    });
};

const reorderQuestionWithinTopics = (
  source: DraggableLocation,
  destination: DraggableLocation,
  { dispatch }: TemplateDragHandlerDeps
): void => {
  dispatch({
    type: EventType.REORDER_QUESTION_REL_REQUESTED,
    payload: { source, destination },
  });
};

const reorderTopic = (
  source: DraggableLocation,
  destination: DraggableLocation,
  { dispatch }: TemplateDragHandlerDeps
): void => {
  dispatch({
    type: EventType.REORDER_TOPIC_REQUESTED,
    payload: { source, destination },
  });
};

/**
 * Entry point for the template editor's drag-and-drop interactions. Routes a
 * drop to the matching handler based on whether a question or a topic was
 * dragged, and where it came from / went to (the question picker drawer vs. a
 * topic column).
 */
export const handleTemplateDragEnd = (
  result: DropResult,
  deps: TemplateDragHandlerDeps
): void => {
  const { source, destination } = result;

  if (!destination || isSamePosition(source, destination)) {
    return;
  }

  if (result.type === 'topic') {
    reorderTopic(source, destination, deps);

    return;
  }

  if (result.type !== 'field') {
    return;
  }

  if (isPicker(source) && !isPicker(destination)) {
    addQuestionToTopic(result, destination, deps);
  } else if (isPicker(destination) && !isPicker(source)) {
    removeQuestionFromTopic(source, deps);
  } else if (!isPicker(source) && !isPicker(destination)) {
    reorderQuestionWithinTopics(source, destination, deps);
  }
};
