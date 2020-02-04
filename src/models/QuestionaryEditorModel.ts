import produce from "immer";
import { Reducer, useCallback, useEffect } from "react";
import {
  ProposalTemplate,
  ProposalTemplateField,
  TemplateStep
} from "../generated/sdk";
import { useDataApi } from "../hooks/useDataApi";
import useReducerWithMiddleWares from "../utils/useReducerWithMiddleWares";
import {
  getFieldById,
  getQuestionaryStepByTopicId,
  getTopicById
} from "./ProposalModelFunctions";

export enum EventType {
  READY,
  REORDER_FIELD_REQUESTED,
  MOVE_TOPIC_REQUESTED,
  UPDATE_TOPIC_TITLE_REQUESTED,
  UPDATE_FIELD_REQUESTED,
  CREATE_NEW_FIELD_REQUESTED,
  FIELD_CREATED,
  DELETE_FIELD_REQUESTED,
  FIELD_DELETED,
  SERVICE_ERROR_OCCURRED,
  FIELD_UPDATED,
  DELETE_TOPIC_REQUESTED,
  CREATE_TOPIC_REQUESTED,
  TOPIC_CREATED,
  REORDER_TOPIC_REQUESTED
}

export interface IEvent {
  type: EventType;
  payload: any;
}

export default function QuestionaryEditorModel(middlewares?: Array<Function>) {
  const blankInitTemplate: ProposalTemplate = { steps: [] };
  const [state, dispatch] = useReducerWithMiddleWares<
    Reducer<ProposalTemplate, IEvent>
  >(reducer, blankInitTemplate, middlewares || []);
  const memoizedDispatch = useCallback(dispatch, []);
  const api = useDataApi();

  useEffect(() => {
    api()
      .getProposalTemplate()
      .then(data => {
        memoizedDispatch({
          type: EventType.READY,
          payload: data.proposalTemplate
        });
      });
  }, [api, memoizedDispatch]);

  function reducer(state: ProposalTemplate, action: IEvent): ProposalTemplate {
    return produce(state, draft => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.REORDER_FIELD_REQUESTED:
          if (!action.payload.destination) {
            return draft;
          }

          var from: any = draft.steps.find(step => {
            return (
              step.topic.topic_id.toString() ===
              action.payload.source.droppableId
            );
          });

          var to: any = draft.steps.find(step => {
            return (
              step.topic.topic_id.toString() ===
              action.payload.destination.droppableId
            );
          });

          to.fields.splice(
            action.payload.destination.index,
            0,
            ...from.fields.splice(action.payload.source.index, 1)
          );

          return draft;
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
          getTopicById(draft, action.payload.topicId)!.topic_title =
            action.payload.title;
          return draft;
        case EventType.UPDATE_FIELD_REQUESTED:
          const field: ProposalTemplateField = action.payload.field;
          const fieldToUpdate = getFieldById(draft, field.proposal_question_id);
          if (field && fieldToUpdate) {
            Object.assign(fieldToUpdate, field);
          } else {
            console.error("Object(s) are not defined", field, fieldToUpdate);
          }
          return draft;
        case EventType.FIELD_CREATED:
          const newField: ProposalTemplateField = action.payload;
          const stepToExtend = getQuestionaryStepByTopicId(
            draft,
            newField.topic_id
          ) as TemplateStep;
          if (stepToExtend) {
            stepToExtend.fields.push(newField);
          }
          return draft;
        case EventType.DELETE_TOPIC_REQUESTED:
          const stepToDelete = getQuestionaryStepByTopicId(
            draft,
            action.payload
          );
          if (!stepToDelete) {
            return;
          }
          const stepIdx = draft.steps.indexOf(stepToDelete);
          draft.steps.splice(stepIdx, 1);
          return draft;
        case EventType.TOPIC_CREATED:
        case EventType.FIELD_UPDATED:
        case EventType.FIELD_DELETED:
          return { ...action.payload };
      }
    });
  }

  return { state, dispatch };
}
