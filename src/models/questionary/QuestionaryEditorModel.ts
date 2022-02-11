/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import {
  Question,
  Template,
  TemplateCategoryId,
  TemplateGroupId,
  TemplateStep,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import {
  getFieldById,
  getQuestionaryStepByTopicId,
  getTopicById,
} from 'models/questionary/QuestionaryFunctions';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

export enum EventType {
  READY,
  CREATE_QUESTION_REQUESTED,
  QUESTION_CREATED,
  QUESTION_UPDATED,
  CREATE_QUESTION_REL_REQUESTED,
  QUESTION_REL_CREATED,
  QUESTION_REL_UPDATED,
  QUESTION_REL_DELETED,
  REORDER_QUESTION_REL_REQUESTED,
  CREATE_TOPIC_REQUESTED,
  DELETE_TOPIC_REQUESTED,
  TOPIC_CREATED,
  TOPIC_REORDERED,
  UPDATE_TOPIC_TITLE_REQUESTED,
  REORDER_TOPIC_REQUESTED,
  PICK_QUESTION_REQUESTED,
  QUESTION_PICKER_NEW_QUESTION_CLICKED,
  SERVICE_ERROR_OCCURRED,
  OPEN_QUESTION_EDITOR,
  QUESTION_DELETED,
  OPEN_QUESTIONREL_EDITOR,
  UPDATE_TEMPLATE_METADATA_REQUESTED,
  TEMPLATE_METADATA_UPDATED,
  DEPENDENCY_HOVER,
}

export interface Event {
  type: EventType;
  payload: any;
}

export default function QuestionaryEditorModel(
  middlewares?: Array<ReducerMiddleware<Template, Event>>
) {
  const { templateId } = useParams<{ templateId: string }>();
  const blankInitTemplate: Template = {
    steps: [],
    templateId: 0,
    isArchived: false,
    name: 'blank',
    complementaryQuestions: [],
    description: '',
    questionaryCount: 0,
    groupId: TemplateGroupId.PROPOSAL,
    group: {
      categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
      groupId: TemplateGroupId.PROPOSAL,
    },
    json: '',
  };

  function reducer(state: Template, action: Event): Template {
    return produce(state, (draft) => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.REORDER_QUESTION_REL_REQUESTED: {
          if (!action.payload.destination) {
            return draft;
          }

          const from = draft.steps.find((step) => {
            return (
              step.topic.id.toString() === action.payload.source.droppableId
            );
          }) as TemplateStep;

          const to = draft.steps.find((step) => {
            return (
              step.topic.id.toString() ===
              action.payload.destination.droppableId
            );
          }) as TemplateStep;

          const [fieldToAddAtDestination] = from.fields.splice(
            action.payload.source.index,
            1
          );

          to.fields.splice(action.payload.destination.index, 0, {
            ...fieldToAddAtDestination,
            sortOrder: action.payload.sortOrder,
          });

          return draft;
        }
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          const topicById = getTopicById(draft.steps, action.payload.topicId);
          if (topicById) {
            topicById.topic.title = action.payload.title;
          }

          return draft;

        case EventType.DELETE_TOPIC_REQUESTED: {
          const stepToDelete = getQuestionaryStepByTopicId(
            draft.steps,
            action.payload
          ) as TemplateStep;
          if (!stepToDelete) {
            return;
          }
          const stepIdx = draft.steps.indexOf(stepToDelete);
          draft.steps.splice(stepIdx, 1);

          return draft;
        }
        case EventType.QUESTION_DELETED: {
          const questionId = action.payload;
          draft.complementaryQuestions.splice(
            draft.complementaryQuestions.findIndex(
              (question) => question.id === questionId
            ),
            1
          );

          return draft;
        }
        case EventType.TOPIC_CREATED:
        case EventType.TOPIC_REORDERED:
        case EventType.QUESTION_REL_UPDATED:
        case EventType.QUESTION_REL_DELETED:
          return { ...action.payload };
        case EventType.QUESTION_CREATED:
          draft.complementaryQuestions.unshift(action.payload);

          return draft;
        case EventType.QUESTION_REL_CREATED:
          return { ...action.payload };
        case EventType.QUESTION_UPDATED: {
          const newQuestion = action.payload as Question;
          const curQuestion =
            draft.complementaryQuestions.find(
              (curQuestion) => curQuestion.id === newQuestion.id
            ) || getFieldById(draft.steps, newQuestion.id)?.question;
          if (newQuestion && curQuestion) {
            Object.assign(curQuestion, newQuestion);
          }

          return draft;
        }
        case EventType.TEMPLATE_METADATA_UPDATED: {
          const metaData: Pick<Template, 'name' | 'description'> =
            action.payload;
          draft.description = metaData.description;
          draft.name = metaData.name;
        }
      }
    });
  }

  const [state, dispatch] = useReducerWithMiddleWares<Reducer<Template, Event>>(
    reducer,
    blankInitTemplate,
    middlewares || []
  );

  // NOTE: required to avoid infinite re-render because dispatch function is recreated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedDispatch = useCallback(dispatch, []);
  const api = useDataApi();

  useEffect(() => {
    api()
      .getTemplate({ templateId: parseInt(templateId) })
      .then((data) => {
        memoizedDispatch({
          type: EventType.READY,
          payload: data.template,
        });
      });
  }, [api, memoizedDispatch, templateId]);

  return { state, dispatch };
}
