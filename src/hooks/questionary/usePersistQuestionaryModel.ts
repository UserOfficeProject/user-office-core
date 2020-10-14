import { prepareAnswers } from 'models/QuestionaryFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from '../../models/QuestionarySubmissionState';
import { usePreSubmitFunctionQueueFactory } from './usePreSubmitFunctionQueueFactory';

export function usePersistQuestionaryModel() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const preSubmitFunctionQueueFactory = usePreSubmitFunctionQueueFactory();

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
            preSubmitFunctionQueueFactory(answers).map(
              async func => await func(getState(), dispatch, api())
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
            .then(result => {
              if (!result.answerTopic.error) {
                dispatch({
                  type: EventType.QUESTIONARY_STEP_ANSWERED,
                  payload: {
                    questionaryStep: result.answerTopic.questionaryStep,
                  },
                });
                dispatch({ type: EventType.GO_STEP_FORWARD });
              }
            });
          break;
        }
        case EventType.SAVE_CLICKED: {
          const answers = action.payload.answers;
          const topicId = action.payload.topicId;
          await Promise.all(
            preSubmitFunctionQueueFactory(answers).map(
              async f => await f(getState(), dispatch, api())
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
            .then(result => {
              if (!result.answerTopic.error) {
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
