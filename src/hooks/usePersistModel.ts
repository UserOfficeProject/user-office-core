import { useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { EventType, IEvent } from "../components/QuestionaryEditorModel";
import {
  ProposalTemplateField,
  ProposalTemplate,
  DataType
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

  const updateItem = async (field: ProposalTemplateField) => {
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
      id: field.proposal_question_id,
      question: field.question,
      config: field.config ? JSON.stringify(field.config) : undefined,
      isEnabled: true, // <-- todo you can use this value, just add new field to ProposalTemplateField
      dependencies: field.dependencies
    };

    setIsLoading(true);
    await sendRequest(mutation, variables);
    setIsLoading(false);
  };


  const createField = async (topicId:number, dataType: DataType) => {
    const mutation = `
    mutation($topicId:Int!, $dataType:String!) {
      createTemplateField(topicId:$topicId, dataType:$dataType) {
        field {
          proposal_question_id
          data_type,
          question
          config,
          topic_id
        }
        error
      }
    }
    `;
    const variables = {
      topicId: topicId,
      dataType: dataType
    };

    setIsLoading(true);
    return sendRequest(mutation, variables).then(result => {
      setIsLoading(false);
      return result.createTemplateField;
    })
  };

  const persistModel = ({ getState, dispatch }: { getState: () => ProposalTemplate, dispatch:React.Dispatch<IEvent> }) => {
    return (next: Function) => (action: IEvent) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case EventType.REORDER_REQUESTED:
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
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          updateTopic(action.payload.topicId, {
            title: action.payload.title as string
          });
          break;
        case EventType.UPDATE_FIELD_REQUESTED:
          updateItem(action.payload.field as ProposalTemplateField);
          break;
        case EventType.CREATE_NEW_FIELD_REQUESTED:
          createField(action.payload.topicId, (action.payload.newField as ProposalTemplateField).data_type).then(result => {
            if(result.field) {
              dispatch({type:EventType.FIELD_CREATED, payload:new ProposalTemplateField(result.field)})
            }
          });
          break;
        default:
          break;
      }
    };
  };



  return { isLoading, persistModel };
}
