import { useState } from 'react';

import {
  DataType,
  ProposalTemplate,
  ProposalTemplateField,
  FieldDependency,
} from '../generated/sdk';
import { EventType, IEvent } from '../models/QuestionaryEditorModel';
import { useDataApi } from './useDataApi';

export function usePersistModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useDataApi();

  const updateFieldTopicRel = async (topicId: number, fieldIds: string[]) => {
    return api()
      .updateFieldTopicRel({
        topicId,
        fieldIds,
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
        topicId,
      })
      .then(data => {
        return data.updateTopic;
      });
  };

  const updateTopicOrder = async (topicOrder: number[]) => {
    return api()
      .updateTopicOrder({
        topicOrder,
      })
      .then(data => data.updateTopicOrder);
  };

  const updateItem = async (field: ProposalTemplateField) => {
    return api()
      .updateProposalTemplateField({
        id: field.proposal_question_id,
        naturalKey: field.natural_key,
        question: field.question,
        config: field.config ? JSON.stringify(field.config) : undefined,
        isEnabled: true, // TODO implement UI for this toggle
        dependencies: field.dependencies
          ? prepareDependencies(field.dependencies)
          : [],
      })
      .then(data => {
        return data.updateProposalTemplateField;
      });
  };

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  const prepareDependencies = (dependencies: FieldDependency[]) => {
    return dependencies.map(dependency => {
      return {
        ...dependency,
        condition: {
          ...dependency.condition,
          params: JSON.stringify({ value: dependency.condition.params }),
        },
      };
    });
  };

  const createTemplateField = async (topicId: number, dataType: DataType) => {
    setIsLoading(true);

    return api()
      .createTemplateField({
        topicId: topicId,
        dataType: dataType,
      })
      .then(data => {
        setIsLoading(false);

        return data.createTemplateField;
      });
  };

  const deleteField = async (id: string) => {
    setIsLoading(true);

    return api()
      .deleteTemplateField({
        id,
      })
      .then(data => {
        setIsLoading(false);

        return data.deleteTemplateField;
      });
  };

  const deleteTopic = async (id: number) => {
    return api()
      .deleteTopic({
        id,
      })
      .then(data => data.deleteTopic);
  };

  const createTopic = async (sortOrder: number) => {
    return api()
      .createTopic({ sortOrder })
      .then(data => {
        return data.createTopic;
      });
  };

  type MonitorableServiceCall = () => Promise<{
    error?: string | null;
  }>;

  const persistModel = ({
    getState,
    dispatch,
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
            payload: result.error,
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
              title: action.payload.title as string,
            })
          );
          break;
        case EventType.UPDATE_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const field = action.payload.field as ProposalTemplateField;
            const result = await updateItem(field);
            dispatch({
              type: EventType.FIELD_UPDATED,
              payload: result.template,
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
                payload: { ...result.field },
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
                payload: result.template,
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
                payload: result.template,
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
