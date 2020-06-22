import { useState } from 'react';

import {
  DataType,
  FieldDependency,
  Template,
  QuestionTemplateRelation,
  Question,
  TemplateCategoryId,
} from '../generated/sdk';
import { Event, EventType } from '../models/QuestionaryEditorModel';
import { useDataApi } from './useDataApi';

export function usePersistModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useDataApi();

  const assignQuestionsToTopic = async (
    templateId: number,
    topicId: number,
    questionIds: string[]
  ) => {
    return api()
      .assignQuestionsToTopic({
        templateId,
        topicId,
        questionIds,
      })
      .then(data => data.assignQuestionsToTopic);
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

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  const prepareDependencies = (dependency: FieldDependency) => {
    return {
      ...dependency,
      condition: {
        ...dependency.condition,
        params: JSON.stringify({ value: dependency.condition.params }),
      },
    };
  };

  const updateQuestion = async (question: Question) => {
    return api()
      .updateQuestion({
        id: question.proposalQuestionId,
        naturalKey: question.naturalKey,
        question: question.question,
        config: question.config ? JSON.stringify(question.config) : undefined,
      })
      .then(data => data.updateQuestion);
  };

  const updateQuestionTopicRelation = async (
    templateId: number,
    field: QuestionTemplateRelation
  ) => {
    return api()
      .updateQuestionTemplateRelation({
        templateId,
        topicId: field.topicId,
        sortOrder: field.sortOrder,
        questionId: field.question.proposalQuestionId,
        config: field.config ? JSON.stringify(field.config) : undefined,
        dependency: field.dependency
          ? prepareDependencies(field.dependency)
          : undefined,
      })
      .then(data => data.updateQuestionTemplateRelation);
  };

  const createQuestion = async (
    categoryId: TemplateCategoryId,
    dataType: DataType
  ) => {
    setIsLoading(true);

    return api()
      .createQuestion({
        categoryId,
        dataType,
      })
      .then(questionResponse => {
        setIsLoading(false);

        return questionResponse.createQuestion;
      });
  };

  const deleteQuestion = async (questionId: string) => {
    return api()
      .deleteQuestion({
        questionId,
      })
      .then(data => data.deleteQuestion);
  };

  const deleteQuestionTemplateRelation = async (
    templateId: number,
    questionId: string
  ) => {
    setIsLoading(true);

    return api()
      .deleteQuestionTemplateRelation({
        templateId,
        questionId,
      })
      .then(data => {
        setIsLoading(false);

        return data.deleteQuestionTemplateRelation;
      });
  };

  const deleteTopic = async (topicId: number) => {
    return api()
      .deleteTopic({
        topicId,
      })
      .then(data => data.deleteTopic);
  };

  const createTopic = async (templateId: number, sortOrder: number) => {
    return api()
      .createTopic({ templateId, sortOrder })
      .then(data => {
        return data.createTopic;
      });
  };

  const createQuestionTemplateRelation = async (
    templateId: number,
    topicId: number,
    questionId: string,
    sortOrder: number
  ) => {
    return api()
      .createQuestionTemplateRelation({
        templateId,
        topicId,
        questionId,
        sortOrder,
      })
      .then(data => {
        return data.createQuestionTemplateRelation;
      });
  };

  const updateProposalMetadata = async (
    templateId: number,
    name: string,
    description: string
  ) => {
    return api()
      .updateTemplate({
        templateId,
        name,
        description,
      })
      .then(data => data.updateTemplate);
  };

  type MonitorableServiceCall = () => Promise<{
    error?: string | null;
  }>;

  const persistModel = ({
    getState,
    dispatch,
  }: {
    getState: () => Template;
    dispatch: React.Dispatch<Event>;
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

    return (next: Function) => (action: Event) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case EventType.REORDER_QUESTION_REL_REQUESTED:
          const reducedTopicId = parseInt(action.payload.source.droppableId);
          const extendedTopicId = parseInt(
            action.payload.destination.droppableId
          );
          const reducedTopic = state.steps.find(
            step => step.topic.id === reducedTopicId
          );
          const extendedTopic = state.steps.find(
            step => step.topic.id === extendedTopicId
          );

          executeAndMonitorCall(() =>
            assignQuestionsToTopic(
              state.templateId,
              reducedTopic!.topic.id,
              reducedTopic!.fields.map(
                field => field.question.proposalQuestionId
              )
            )
          );
          if (reducedTopicId !== extendedTopicId) {
            executeAndMonitorCall(() =>
              assignQuestionsToTopic(
                state.templateId,
                extendedTopic!.topic.id,
                extendedTopic!.fields.map(
                  field => field.question.proposalQuestionId
                )
              )
            );
          }
          break;
        case EventType.REORDER_TOPIC_REQUESTED:
          const topicOrder = state.steps.map(step => step.topic.id);
          executeAndMonitorCall(() => updateTopicOrder(topicOrder));
          break;
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          executeAndMonitorCall(() =>
            updateTopic(action.payload.topicId, {
              title: action.payload.title as string,
            })
          );
          break;
        case EventType.UPDATE_QUESTION_REQUESTED:
          executeAndMonitorCall(async () => {
            const question = action.payload.field as Question;
            const result = await updateQuestion(question);
            dispatch({
              type: EventType.QUESTION_UPDATED,
              payload: result.question,
            });

            return result;
          });
          break;
        case EventType.UPDATE_QUESTION_REL_REQUESTED:
          executeAndMonitorCall(async () => {
            const questionRel = action.payload
              .field as QuestionTemplateRelation;
            const templateId = action.payload.templateId;
            const result = await updateQuestionTopicRelation(
              templateId,
              questionRel
            );
            if (result.template) {
              dispatch({
                type: EventType.QUESTION_REL_UPDATED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        case EventType.CREATE_QUESTION_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createQuestion(
              state.categoryId,
              action.payload.dataType
            );
            if (result.question) {
              dispatch({
                type: EventType.QUESTION_CREATED,
                payload: result.question,
              });
            }

            return result;
          });
          break;
        case EventType.DELETE_QUESTION_REL_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await deleteQuestionTemplateRelation(
              state.templateId,
              action.payload.fieldId
            );
            if (result.template) {
              dispatch({
                type: EventType.QUESTION_REL_DELETED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        case EventType.DELETE_TOPIC_REQUESTED:
          executeAndMonitorCall(() => deleteTopic(action.payload));
          break;
        case EventType.DELETE_QUESTION_REQUESTED: {
          executeAndMonitorCall(async () => {
            const result = await deleteQuestion(action.payload.questionId);
            if (result.question) {
              dispatch({
                type: EventType.QUESTION_DELETED,
                payload: result.question.proposalQuestionId,
              });
            }

            return result;
          });
          break;
        }
        case EventType.CREATE_TOPIC_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createTopic(
              state.templateId,
              action.payload.sortOrder
            );
            if (result.template) {
              dispatch({
                type: EventType.TOPIC_CREATED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        case EventType.UPDATE_TEMPLATE_METADATA_REQUESTED: {
          const { templateId, name, description } = action.payload;

          return executeAndMonitorCall(async () => {
            const result = await updateProposalMetadata(
              templateId,
              name,
              description
            );
            if (result.template) {
              dispatch({
                type: EventType.TEMPLATE_METADATA_UPDATED,
                payload: result.template,
              });
            }

            return result;
          });
        }
        case EventType.CREATE_QUESTION_REL_REQUESTED:
          const { questionId, topicId, sortOrder, templateId } = action.payload;

          executeAndMonitorCall(async () => {
            const result = await createQuestionTemplateRelation(
              templateId,
              topicId,
              questionId,
              sortOrder
            );
            if (result.template) {
              dispatch({
                type: EventType.QUESTION_REL_CREATED,
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
