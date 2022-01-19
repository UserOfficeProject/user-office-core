import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import {
  Event,
  QuestionarySubmissionState,
} from './QuestionarySubmissionState';

type HandlerFunction<T extends QuestionarySubmissionState> = (
  state: T,
  action: Event
) => void;

export default function createCustomEventHandlers<
  T extends QuestionarySubmissionState
>(handler: HandlerFunction<T>) {
  const eventHandler = ({
    getState,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: FunctionType) => async (action: Event) => {
      next(action); // first update state/model
      handler(getState() as T, action);
    };
  };

  return eventHandler;
}
