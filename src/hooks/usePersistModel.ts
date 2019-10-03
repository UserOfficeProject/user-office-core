import { useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ActionType, IAction } from "../components/QuestionaryEditorModel";
import {
  ProposalTemplateField,
  ProposalTemplate
} from "../model/ProposalModel";

export function usePersistModel() {
  const sendRequest = useDataAPI();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFieldTopicRel = async (topicId: number, fieldIds: string[]) => {
    const mutation = `
    mutation($topicId:Int!, $fieldIds:[String]) {
      updateFieldTopicRel(topic_id:$topicId, field_ids:$fieldIds) {
        result
        error
      }
    }
    `;
    const variables = {
      topicId,
      fieldIds
    };

    setIsLoading(true);
    await sendRequest(mutation, variables);
    setIsLoading(false);
  };

  const updateTopic = async (
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ) => {
    const mutation = `
    mutation($topicId:Int!, $title:String, $isEnabled:Boolean) {
      updateTopic(id:$topicId, title:$title, isEnabled:$isEnabled) {
        error
      }
    }
    `;
    const variables = {
      ...values,
      topicId
    };

    setIsLoading(true);
    await sendRequest(mutation, variables);
    setIsLoading(false);
  };

  const persistModel = ({ getState }: { getState: () => ProposalTemplate }) => {
    return (next: Function) => (action: IAction) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case ActionType.MOVE_ITEM:
          const reducedTopicId = parseInt(action.payload.source.droppableId);
          const extendedTopicId = parseInt(
            action.payload.destination.droppableId
          );
          const reducedTopic = state.topics.find(
            topic => topic.topic_id == reducedTopicId
          );
          const extendedTopic = state.topics.find(
            topic => topic.topic_id == extendedTopicId
          );

          updateFieldTopicRel(
            reducedTopic!.topic_id,
            reducedTopic!.fields.map(field => field.proposal_question_id)
          );
          if (reducedTopicId !== extendedTopicId) {
            updateFieldTopicRel(
              extendedTopic!.topic_id,
              extendedTopic!.fields.map(field => field.proposal_question_id)
            );
          }
          break;
        case ActionType.UPDATE_TOPIC_TITLE:
          updateTopic(action.payload.topicId, {
            title: action.payload.title as string
          });
          break;
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
