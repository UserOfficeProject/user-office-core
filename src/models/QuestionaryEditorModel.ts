import produce from 'immer';
import { Reducer, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import {
  Template,
  Question,
  QuestionTemplateRelation,
  TemplateCategoryId,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import {
  getFieldById,
  getQuestionaryStepByTopicId,
  getTopicById,
} from 'models/ProposalModelFunctions';
import {
  useReducerWithMiddleWares,
  ReducerMiddleware,
} from 'utils/useReducerWithMiddleWares';

export enum EventType {
  READY,
  CREATE_QUESTION_REQUESTED,
  UPDATE_QUESTION_REQUESTED,
  DELETE_QUESTION_REQUESTED,
  QUESTION_CREATED,
  QUESTION_UPDATED,
  CREATE_QUESTION_REL_REQUESTED,
  UPDATE_QUESTION_REL_REQUESTED,
  DELETE_QUESTION_REL_REQUESTED,
  QUESTION_REL_CREATED,
  QUESTION_REL_UPDATED,
  QUESTION_REL_DELETED,
  REORDER_QUESTION_REL_REQUESTED,
  CREATE_TOPIC_REQUESTED,
  DELETE_TOPIC_REQUESTED,
  TOPIC_CREATED,
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
}

export interface Event {
  type: EventType;
  payload: any;
}

export default function QuestionaryEditorModel(
  middlewares?: Array<ReducerMiddleware<Template, Event>>
) {
  const { templateId } = useParams();
  const blankInitTemplate: Template = {
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    steps: [],
    templateId: 0,
    isArchived: false,
    name: 'blank',
    complementaryQuestions: [],
    description: '',
  };

  function reducer(state: Template, action: Event): Template {
    return produce(state, draft => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.REORDER_QUESTION_REL_REQUESTED: {
          if (!action.payload.destination) {
            return draft;
          }

          const from = draft.steps.find(step => {
            return (
              step.topic.id.toString() === action.payload.source.droppableId
            );
          })!;

          const to = draft.steps.find(step => {
            return (
              step.topic.id.toString() ===
              action.payload.destination.droppableId
            );
          })!;

          to.fields.splice(
            action.payload.destination.index,
            0,
            ...from.fields.splice(action.payload.source.index, 1)
          );

          return draft;
        }
        case EventType.REORDER_TOPIC_REQUESTED:
          if (!action.payload.destination) {
            return draft;
          }

          draft.steps.splice(
            action.payload.destination.index,
            0,
            ...draft.steps.splice(action.payload.source.index, 1)
          );

          return draft;
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          getTopicById(draft.steps, action.payload.topicId).topic_title =
            action.payload.title;

          return draft;
        case EventType.UPDATE_QUESTION_REL_REQUESTED: {
          const questionRel: QuestionTemplateRelation = action.payload.field;
          const questionRelToUpdate = getFieldById(
            draft.steps,
            questionRel.question.proposalQuestionId
          );
          if (questionRel && questionRelToUpdate) {
            Object.assign(questionRelToUpdate, questionRel);
          }

          return draft;
        }
        case EventType.UPDATE_QUESTION_REQUESTED: {
          const field: Question = action.payload.field;
          const fieldToUpdate = draft.complementaryQuestions.find(
            question => question.proposalQuestionId === field.proposalQuestionId
          );
          if (field && fieldToUpdate) {
            Object.assign(fieldToUpdate, field);
          }

          return draft;
        }

        case EventType.DELETE_TOPIC_REQUESTED: {
          const stepToDelete = getQuestionaryStepByTopicId(
            draft.steps,
            action.payload
          );
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
              question => question.proposalQuestionId === questionId
            ),
            1
          );

          return draft;
        }
        case EventType.TOPIC_CREATED:
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
              curQuestion =>
                curQuestion.proposalQuestionId ===
                newQuestion.proposalQuestionId
            ) || getFieldById(draft.steps, newQuestion.proposalQuestionId);
          if (newQuestion && curQuestion) {
            Object.assign(curQuestion.question, newQuestion);
          }

          return draft;
        }
        case EventType.TEMPLATE_METADATA_UPDATED: {
          return { ...draft, ...action.payload };
        }
      }
    });
  }

  const [state, dispatch] = useReducerWithMiddleWares<Reducer<Template, Event>>(
    reducer,
    blankInitTemplate,
    middlewares || []
  );
  const memoizedDispatch = useCallback(dispatch, []); // required to avoid infinite re-render because dispatch function is recreated
  const api = useDataApi();

  useEffect(() => {
    api()
      .getTemplate({ templateId: parseInt(templateId!) })
      .then(data => {
        memoizedDispatch({
          type: EventType.READY,
          payload: data.template,
        });
      });
  }, [api, memoizedDispatch, templateId]);

  return { state, dispatch };
}
