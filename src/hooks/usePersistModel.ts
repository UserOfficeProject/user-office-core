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
        error
      }
    }
    `;
    const variables = {
      topicId,
      fieldIds
    };

    return sendRequest(mutation, variables).then(
      (result: {
        updateFieldTopicRel: {
          error?: string;
        };
      }) => {
        return result.updateFieldTopicRel;
      }
    );
  };

  const updateTopic = async (
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ) => {
    const mutation = `
    mutation($topicId:Int!, $title:String, $isEnabled:Boolean) {
      updateTopic(id:$topicId, title:$title, isEnabled:$isEnabled) {
        topic {
          topic_id
        }
        error
      }
    }
    `;
    const variables = {
      ...values,
      topicId
    };

    return sendRequest(mutation, variables).then(
      (result: {
        updateTopic: {
          error?: string;
          topic?: { topic_id: number };
        };
      }) => {
        return result.updateTopic;
      }
    );
  };

  const updateItem = async (field: ProposalTemplateField) => {
    const mutation = `
    mutation($id:String!, $question:String, $config:String, $isEnabled:Boolean, $dependencies:[FieldDependencyInput]) {
      updateProposalTemplateField(id:$id, question:$question, config:$config, isEnabled:$isEnabled, dependencies:$dependencies) {
        template {
          topics {
            topic_title
            topic_id,
            fields {
              proposal_question_id
              data_type
              question
              config
              dependencies {
                proposal_question_dependency
                condition
                proposal_question_id
              }
            }
          }
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
        ? field.dependencies.map(dep => {
            return { ...dep, condition: JSON.stringify(dep.condition) };
          })
        : []
    };

    return sendRequest(mutation, variables).then(
      (result: {
        updateProposalTemplateField: {
          error?: string;
          template?: ProposalTemplate;
        };
      }) => {
        return result.updateProposalTemplateField;
      }
    );
  };

  const createTemplateField = async (topicId: number, dataType: DataType) => {
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
    return sendRequest(mutation, variables).then(
      (result: {
        createTemplateField: {
          error?: string;
          field?: {
            proposal_question_id: string;
            ddata_type: DataType;
            question: string;
            config: string;
            topic_id: number;
          };
        };
      }) => {
        setIsLoading(false);
        return result.createTemplateField;
      }
    );
  };

  const deleteField = async (id: number) => {
    const mutation = `
    mutation($id:String!) {
      deleteTemplateField(id:$id) {
        template {
          topics {
            topic_title
            topic_id,
            fields {
              proposal_question_id
              data_type
              question
              config
              dependencies {
                proposal_question_dependency
                condition
                proposal_question_id
              }
            }
          }
        }
        error
      }
    }
    `;
    const variables = {
      id
    };

    setIsLoading(true);
    return sendRequest(mutation, variables).then(
      (data: {
        deleteTemplateField: { error?: string; template?: ProposalTemplate };
      }) => {
        setIsLoading(false);
        return data.deleteTemplateField;
      }
    );
  };

  const deleteTopic = async (id: number) => {
    const mutation = `
    mutation($id:Int!) {
      deleteTopic(id:$id) {
        error
      }
    }
    `;
    const variables = {
      id
    };

    return sendRequest(mutation, variables).then(
      (result: {
        deleteTopic: {
          error?: string;
        };
      }) => {
        return result.deleteTopic;
      }
    );
  };

  type MonitorableServiceCall = () => Promise<{ error?: string }>;

  const persistModel = ({
    getState,
    dispatch
  }: {
    getState: () => ProposalTemplate;
    dispatch: React.Dispatch<IEvent>;
  }) => {
    const executeAndMonitorCall = (call: MonitorableServiceCall) => {
      setIsLoading(true);
      call().then(result => {
        if (result.error) {
          dispatch({
            type: EventType.SERVICE_ERROR_OCCURRED,
            payload: result.error
          });
        }
        setIsLoading(false);
      });
    };

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

          executeAndMonitorCall(() =>
            updateFieldTopicRel(
              reducedTopic!.topic_id,
              reducedTopic!.fields.map(field => field.proposal_question_id)
            )
          );
          if (reducedTopicId !== extendedTopicId) {
            executeAndMonitorCall(() =>
              updateFieldTopicRel(
                extendedTopic!.topic_id,
                extendedTopic!.fields.map(field => field.proposal_question_id)
              )
            );
          }
          break;
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          executeAndMonitorCall(() =>
            updateTopic(action.payload.topicId, {
              title: action.payload.title as string
            })
          );
          break;
        case EventType.UPDATE_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const field = action.payload.field as ProposalTemplateField;
            const result = await updateItem(field);
            dispatch({
              type: EventType.FIELD_UPDATED,
              payload: new ProposalTemplateField(result.template)
            });
            return result;
          });
          break;
        case EventType.CREATE_NEW_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createTemplateField(
              action.payload.topicId,
              (action.payload.newField as ProposalTemplateField).data_type
            );
            if (result.field) {
              dispatch({
                type: EventType.FIELD_CREATED,
                payload: new ProposalTemplateField(result.field)
              });
            }
            return result;
          });
          break;
        case EventType.DELETE_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await deleteField(action.payload.fieldId);
            if (result.template) {
              dispatch({
                type: EventType.FIELD_DELETED,
                payload: result.template
              });
            }
            return result;
          });
          break;
        case EventType.DELETE_TOPIC_REQUESTED:
          executeAndMonitorCall(() => deleteTopic(action.payload));
          break;
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
