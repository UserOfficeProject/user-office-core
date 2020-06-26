import produce from 'immer';
import { Dispatch, Reducer } from 'react';

import { Answer, Questionary } from '../generated/sdk';
import useReducerWithMiddleWares from '../utils/useReducerWithMiddleWares';
import { getFieldById } from './ProposalModelFunctions';

export enum EventType {
  SAVE_CLICKED = 'SAVE_CLICKED',
  FIELD_CHANGED = 'FIELD_CHANGED',
  CANCEL_CLICKED = 'CANCEL_CLICKED',
}
export interface Event {
  type: EventType;
  payload?: any;
}

export interface SubquestionarySubmissionModelState {
  isDirty: boolean;
  questionary: Questionary;
}
export type MiddlewareSignature = ({
  getState,
  dispatch,
}: {
  getState: () => SubquestionarySubmissionModelState;
  dispatch: React.Dispatch<Event>;
}) => (next: Function) => (action: Event) => void;

export function SubquestionarySubmissionModel(
  initialState: SubquestionarySubmissionModelState,
  middlewares?: Array<MiddlewareSignature>
): {
  state: SubquestionarySubmissionModelState;
  dispatch: Dispatch<Event>;
} {
  function reducer(state: SubquestionarySubmissionModelState, action: Event) {
    return produce(state, draftState => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.questionary.steps,
            action.payload.id
          ) as Answer;
          field.value = action.payload.newValue;

          return draftState;
      }
    });
  }

  const [modelState, dispatch] = useReducerWithMiddleWares<
    Reducer<SubquestionarySubmissionModelState, Event>
  >(reducer, initialState, middlewares || []);

  return { state: modelState, dispatch };
}
