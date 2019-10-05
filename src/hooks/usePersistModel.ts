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

  const updateItem = async (field:ProposalTemplateField) => {
    const mutation = `
    mutation($id:String!, $question:String, $config:String, $isEnabled:Boolean, $dependencies:[FieldDependencyInput]) {
      updateProposalTemplateField(id:$id, question:$question, config:$config, isEnabled:$isEnabled, dependencies:$dependencies) {
        field {
          proposal_question_id
        }
        error
      }
    }
    `;
    const variables = {
      id:field.proposal_question_id,
      question:field.question,
      config: field.config ? JSON.stringify(field.config) : undefined,
      isEnabled: true, // <-- todo you can use this value, just add new field to ProposalTemplateField
      dependencies: field.dependencies
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
            topic => topic.topic_id === reducedTopicId
          );
          const extendedTopic = state.topics.find(
            topic => topic.topic_id === extendedTopicId
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
        case ActionType.UPDATE_ITEM:
          let field:ProposalTemplateField = action.payload.field;
          updateItem(field);
          break;
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
