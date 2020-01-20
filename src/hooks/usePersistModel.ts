import { useState } from "react";
import { EventType, IEvent } from "../models/QuestionaryEditorModel";
import { useDataApi2 } from "./useDataApi2";
import {
  ProposalTemplateField,
  ProposalTemplate,
  Topic,
  DataType
} from "../generated/sdk";

export function usePersistModel() {
  const api = useDataApi2();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFieldTopicRel = async (topicId: number, fieldIds: string[]) => {
    return api()
      .updateFieldTopicRel({
        topicId,
        fieldIds
      })
      .then(data => data.updateFieldTopicRel);
  };

  const updateTopic = async (
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ) => {
    return api()
      .updateTopic({
        ...values,
        topicId
      })
      .then(data => {
        const { error, topic } = data.updateTopic;
        return { error, topic: topicFromServerResponse(topic) };
      });
  };

  const updateTopicOrder = async (topicOrder: number[]) => {
    return api()
      .updateTopicOrder({
        topicOrder
      })
      .then(data => data.updateTopicOrder);
  };

  const updateItem = async (field: ProposalTemplateField) => {
    return api()
      .updateProposalTemplateField({
        id: field.proposal_question_id,
        question: field.question,
        config: field.config ? JSON.stringify(field.config) : undefined,
        isEnabled: true, // <-- todo you can use this value, just add new field to ProposalTemplateField
        dependencies: field.dependencies ? field.dependencies : []
      })
      .then(data => {
        const { error, template } = data.updateProposalTemplateField;
        return { error, template: templateFromServerResponse(template) };
      });
  };

  const createTemplateField = async (topicId: number, dataType: DataType) => {
    setIsLoading(true);
    return api()
      .createTemplateField({
        topicId: topicId,
        dataType: dataType
      })
      .then(data => {
        setIsLoading(false);
        const { error, field } = data.createTemplateField;
        return {
          error,
          field: templateFieldFromServerResponse(field)
        };
      });
  };

  const deleteField = async (id: string) => {
    setIsLoading(true);
    return api()
      .deleteTemplateField({
        id
      })
      .then(data => {
        setIsLoading(false);
        const { error, template } = data.deleteTemplateField;
        return { error, template: templateFromServerResponse(template) };
      });
  };

  const deleteTopic = async (id: number) => {
    return api()
      .deleteTopic({
        id
      })
      .then(data => data.deleteTopic);
  };

  const createTopic = async (sortOrder: number) => {
    return api()
      .createTopic({ sortOrder })
      .then(data => {
        const { error, template } = data.createTopic;
        return { error, template: templateFromServerResponse(template) };
      });
  };

  // TODO see if this can be deleted and use the response value directly
  const templateFromServerResponse = (obj: ProposalTemplate | null) => {
    if (obj) {
      return { ...obj };
    }
    return obj;
  };

  // TODO see if this can be deleted and use the response value directly
  const topicFromServerResponse = (obj: Topic | null) => {
    if (obj) {
      return { ...obj };
    }
    return obj;
  };

  // TODO see if this can be deleted and use the response value directly
  const templateFieldFromServerResponse = (
    obj: ProposalTemplateField | null
  ) => {
    if (obj) {
      return { ...obj };
    }
    return obj;
  };

  type MonitorableServiceCall = () => Promise<{
    error?: string | null;
  }>;

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
        case EventType.REORDER_FIELD_REQUESTED:
          const reducedTopicId = parseInt(action.payload.source.droppableId);
          const extendedTopicId = parseInt(
            action.payload.destination.droppableId
          );
          const reducedTopic = state.steps.find(
            step => step.topic.topic_id === reducedTopicId
          );
          const extendedTopic = state.steps.find(
            step => step.topic.topic_id === extendedTopicId
          );

          executeAndMonitorCall(() =>
            updateFieldTopicRel(
              reducedTopic!.topic.topic_id,
              reducedTopic!.fields.map(field => field.proposal_question_id)
            )
          );
          if (reducedTopicId !== extendedTopicId) {
            executeAndMonitorCall(() =>
              updateFieldTopicRel(
                extendedTopic!.topic.topic_id,
                extendedTopic!.fields.map(field => field.proposal_question_id)
              )
            );
          }
          break;
        case EventType.REORDER_TOPIC_REQUESTED:
          const topicOrder = state.steps.map(step => step.topic.topic_id);
          executeAndMonitorCall(() => updateTopicOrder(topicOrder));
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
              payload: result.template
            });
            return result;
          });
          break;
        case EventType.CREATE_NEW_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createTemplateField(
              action.payload.topicId,
              action.payload.dataType
            );
            if (result.field) {
              dispatch({
                type: EventType.FIELD_CREATED,
                payload: { ...result.field }
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
        case EventType.CREATE_TOPIC_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createTopic(action.payload.sortOrder);
            if (result.template) {
              dispatch({
                type: EventType.TOPIC_CREATED,
                payload: result.template
              });
            }
            return result;
          });
          break;
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
