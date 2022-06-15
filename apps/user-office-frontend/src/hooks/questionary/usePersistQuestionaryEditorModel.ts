import { useState } from 'react';

import {
  DataType,
  QuestionTemplateRelation,
  Rejection,
  Template,
  TemplateCategoryId,
} from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export function usePersistQuestionaryEditorModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { api } = useDataApiWithFeedback();

  const updateTopic = async (
    topicId: number,
    values: {
      templateId?: number;
      title?: string;
      sortOrder?: number;
      isEnabled?: boolean;
    }
  ) => {
    return api()
      .updateTopic({
        ...values,
        topicId,
      })
      .then((data) => {
        return data.updateTopic;
      });
  };

  const updateQuestionTemplateRelation = async (
    templateId: number,
    field: QuestionTemplateRelation
  ) => {
    return api()
      .updateQuestionTemplateRelation({
        templateId,
        topicId: field.topicId,
        sortOrder: field.sortOrder,
        questionId: field.question.id,
        config: field.config ? JSON.stringify(field.config) : undefined,
      })
      .then((data) => data.updateQuestionTemplateRelation);
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
      .then((questionResponse) => {
        setIsLoading(false);

        return questionResponse.createQuestion;
      });
  };

  const deleteTopic = async (topicId: number) => {
    return api()
      .deleteTopic({
        topicId,
      })
      .then((data) => data.deleteTopic);
  };

  const createTopic = async (templateId: number, sortOrder: number) => {
    return api()
      .createTopic({ templateId, sortOrder })
      .then((data) => {
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
      .then((data) => {
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
      .then((data) => data.updateTemplate);
  };

  type MonitorableServiceCall = () => Promise<{
    rejection?: Rejection | null;
  }>;

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<Template, Event>) => {
    const executeAndMonitorCall = (call: MonitorableServiceCall) => {
      setIsLoading(true);
      call().then((result) => {
        if (result.rejection) {
          dispatch({
            type: EventType.SERVICE_ERROR_OCCURRED,
            payload: result.rejection.reason,
          });
        }
        setIsLoading(false);
      });
    };

    return (next: FunctionType) => (action: Event) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case EventType.REORDER_QUESTION_REL_REQUESTED:
          const reducedTopicId = parseInt(action.payload.source.droppableId);
          const extendedTopicId = parseInt(
            action.payload.destination.droppableId
          );
          const reducedTopic = state.steps.find(
            (step) => step.topic.id === reducedTopicId
          );
          const extendedTopic = state.steps.find(
            (step) => step.topic.id === extendedTopicId
          );

          let destinationTopic = reducedTopic;

          if (reducedTopicId !== extendedTopicId) {
            destinationTopic = extendedTopic;
          }

          const questionRelToChange =
            destinationTopic?.fields[action.payload.destination.index];

          const newSortOrder = action.payload.destination.index;

          const questionRel = {
            ...questionRelToChange,
            sortOrder: newSortOrder,
            topicId: destinationTopic?.topic.id,
          } as QuestionTemplateRelation;

          executeAndMonitorCall(() =>
            updateQuestionTemplateRelation(state.templateId, questionRel)
          );
          break;
        case EventType.REORDER_TOPIC_REQUESTED: {
          const sourceIndex = action.payload.source.index;
          const destinationIndex = action.payload.destination.index;

          const stepToUpdate = state.steps[sourceIndex];
          const sortOrder = destinationIndex;

          executeAndMonitorCall(async () => {
            const result = await updateTopic(stepToUpdate.topic.id, {
              sortOrder,
              templateId: state.templateId,
              title: stepToUpdate.topic.title,
            });

            if (result.template) {
              dispatch({
                type: EventType.TOPIC_REORDERED,
                payload: result.template,
              });
            }

            return result;
          });

          break;
        }
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          executeAndMonitorCall(() =>
            updateTopic(action.payload.topicId, {
              title: action.payload.title as string,
              templateId: state.templateId,
              sortOrder: action.payload.sortOrder,
            })
          );
          break;

        case EventType.CREATE_QUESTION_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createQuestion(
              state.group.categoryId,
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
        case EventType.DELETE_TOPIC_REQUESTED:
          executeAndMonitorCall(() => deleteTopic(action.payload));
          break;
        case EventType.CREATE_TOPIC_REQUESTED: {
          const { isFirstStep, topicId } = action.payload;
          let sortOrder = 0;

          if (!isFirstStep) {
            const stepIndex = state.steps.findIndex(
              (stepItem) => stepItem.topic.id === topicId
            );

            const previousStep = state.steps[stepIndex];

            sortOrder = previousStep ? previousStep.topic.sortOrder + 1 : 0;
          }

          executeAndMonitorCall(async () => {
            const result = await createTopic(state.templateId, sortOrder);
            if (result.template) {
              dispatch({
                type: EventType.TOPIC_CREATED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        }
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
