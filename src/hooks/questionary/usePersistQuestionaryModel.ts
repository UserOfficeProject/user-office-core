import { prepareAnswers } from 'models/QuestionaryFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from '../../models/QuestionarySubmissionState';
import { usePostSubmitActions, usePreSubmitActions } from './useSubmitActions';

export function usePersistQuestionaryModel() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const preSubmitActions = usePreSubmitActions();
  const postSubmitActions = usePostSubmitActions();

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SAVE_AND_CONTINUE_CLICKED: {
          const answers = action.payload.answers;
          const topicId = action.payload.topicId;

          await Promise.all(
            preSubmitActions(answers).map(
              async func =>
                await func({ state: getState(), dispatch, api: api() })
            )
          );

          const questionaryId = getState().questionaryId;
          if (!questionaryId) {
            return;
          }
          api('Saved')
            .answerTopic({
              questionaryId: questionaryId,
              answers: prepareAnswers(answers),
              topicId: topicId,
              isPartialSave: false,
            })
            .then(async result => {
              if (result.answerTopic.questionaryStep) {
                await Promise.all(
                  postSubmitActions(
                    result.answerTopic.questionaryStep.fields
                  ).map(
                    async f =>
                      await f({ state: getState(), dispatch, api: api() })
                  )
                );

                dispatch({
                  type: EventType.QUESTIONARY_STEP_ANSWERED,
                  payload: {
                    questionaryStep: result.answerTopic.questionaryStep,
                  },
                });

                const state = getState();
                const nextStepIndex = state.stepIndex + 1;
                const lastStepIndex = state.steps.length - 1;
                if (nextStepIndex > lastStepIndex) {
                  dispatch({ type: EventType.QUESTIONARY_STEPS_COMPLETE });
                } else {
                  dispatch({ type: EventType.GO_STEP_FORWARD });
                }
              }
            });
          break;
        }
        case EventType.SAVE_CLICKED: {
          const answers = action.payload.answers;
          const topicId = action.payload.topicId;
          await Promise.all(
            preSubmitActions(answers).map(
              async f => await f({ state: getState(), dispatch, api: api() })
            )
          );

          const questionaryId = getState().questionaryId;
          if (!questionaryId) {
            return;
          }
          api('Saved')
            .answerTopic({
              questionaryId: questionaryId,
              answers: prepareAnswers(answers),
              topicId: topicId,
              isPartialSave: true,
            })
            .then(async result => {
              if (result.answerTopic.questionaryStep) {
                await Promise.all(
                  postSubmitActions(
                    result.answerTopic.questionaryStep.fields
                  ).map(
                    async f =>
                      await f({ state: getState(), dispatch, api: api() })
                  )
                );
                dispatch({
                  type: EventType.QUESTIONARY_STEP_ANSWERED,
                  payload: {
                    questionaryStep: result.answerTopic.questionaryStep,
                  },
                });
              }
            });
        }
      }
    };
  };

  return { isSavingModel: isExecutingCall, persistModel };
}
