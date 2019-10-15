import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate";
import { Reducer, useEffect, useCallback } from "react";
import {
  ProposalTemplate,
  ProposalTemplateField
} from "../model/ProposalModel";
import produce from "immer";
import useReducerWithMiddleWares from "../utils/useReducerWithMiddleWares";

export enum EventType {
  READY,
  REORDER_REQUESTED,
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
  TOPIC_CREATED
}

export interface IEvent {
  type: EventType;
  payload: any;
}

export default function QuestionaryEditorModel(middlewares?: Array<Function>) {
  const blankInitTemplate = new ProposalTemplate();
  const [state, dispatch] = useReducerWithMiddleWares<
    Reducer<ProposalTemplate, IEvent>
  >(reducer, blankInitTemplate, middlewares || []);
  const memoizedDispatch = useCallback(dispatch, []);

  const getProposalTemplateRequest = useProposalQuestionTemplate();

  useEffect(() => {
    getProposalTemplateRequest().then(data => {
      memoizedDispatch({
        type: EventType.READY,
        payload: data
      });
    });
  }, [getProposalTemplateRequest, memoizedDispatch]);

  function reducer(state: ProposalTemplate, action: IEvent): ProposalTemplate {
    return produce(state, draft => {
      switch (action.type) {
        case EventType.READY:
          return action.payload;
        case EventType.REORDER_REQUESTED:
          if (!action.payload.destination) {
            return draft;
          }

          var from: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() === action.payload.source.droppableId
            );
          });

          var to: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() ===
              action.payload.destination.droppableId
            );
          });

          to.fields.splice(
            action.payload.destination.index,
            0,
            ...from.fields.splice(action.payload.source.index, 1)
          );

          return draft;
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          draft.getTopicById(action.payload.topicId)!.topic_title =
            action.payload.title;
          return draft;
        case EventType.UPDATE_FIELD_REQUESTED:
          const field: ProposalTemplateField = action.payload.field;
          const fieldToUpdate = draft.getFieldById(field.proposal_question_id);
          if (field && fieldToUpdate) {
            Object.assign(fieldToUpdate, field);
          } else {
            console.error("Object(s) are not defined", field, fieldToUpdate);
          }
          return draft;
        case EventType.FIELD_CREATED:
          const newField: ProposalTemplateField = action.payload;
          draft.addField(newField);
          return new ProposalTemplate(draft);

        case EventType.DELETE_TOPIC_REQUESTED:
          const topic = draft.topics.find(
            topic => topic.topic_id === action.payload
          );
          if (!topic) {
            return;
          }
          const topicIdx = draft.topics.indexOf(topic);
          draft.topics.splice(topicIdx, 1);
          return new ProposalTemplate(draft);
        case EventType.TOPIC_CREATED:
        case EventType.FIELD_UPDATED:
        case EventType.FIELD_DELETED:
          return new ProposalTemplate(action.payload);
      }
    });
  }

  return { state, dispatch };
}
