import produce from 'immer';
import { Reducer } from 'react';

import { Answer, QuestionaryStep } from 'generated/sdk';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

import { getFieldById } from './QuestionaryFunctions';

export enum EventType {
  FIELD_CHANGED = 'FIELD_CHANGED',
  QUESTIONARY_STEPS_COMPLETE = 'QUESTIONARY_STEPS_COMPLETE',
  BACK_CLICKED = 'BACK_CLICKED',
  RESET_CLICKED = 'RESET_CLICKED',
  GO_STEP_BACK = 'GO_TO_STEP_REQUESTED',
  GO_STEP_FORWARD = 'GO_STEP_FORWARD',
  GO_TO_STEP = 'GO_TO_STEP',
  QUESTIONARY_STEPS_LOADED = 'QUESTIONARY_STEPS_LOADED',
  QUESTIONARY_STEP_ANSWERED = 'QUESTIONARY_STEP_ANSWERED',
  SAVE_AND_CONTINUE_CLICKED = 'SAVE_AND_CONTINUE_CLICKED',
  SAVE_CLICKED = 'SAVE_CLICKED',
  SAMPLE_CREATED = 'SAMPLE_CREATED',
  SAMPLE_UPDATED = 'SAMPLE_UPDATED',
  SAMPLE_LOADED = 'SAMPLE_LOADED',
  SAMPLE_MODIFIED = 'SAMPLE_MODIFIED',
  SAVE_GENERAL_INFO_CLICKED = 'SAVE_GENERAL_INFO_CLICKED',
  PROPOSAL_MODIFIED = 'PROPOSAL_MODIFIED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_LOADED = 'PROPOSAL_LOADED',
  PROPOSAL_SUBMIT_CLICKED = 'PROPOSAL_SUBMIT_CLICKED',
}
export interface Event {
  type: EventType;
  payload?: any;
}

export interface QuestionarySubmissionState {
  questionaryId: number | null; // null if questionary not created yet
  steps: QuestionaryStep[]; // blank of filled out steps. If blank, then questionaryId will be null
  templateId: number;
  stepIndex: number;
  isDirty: boolean;
}

const setStepIndexIfValid = (
  state: QuestionarySubmissionState,
  stepIndex: number
) => {
  const firstStepIndex = 0;
  const lastStepIndex = state.steps.length - 1;
  if (firstStepIndex >= 0 && stepIndex <= lastStepIndex) {
    state.stepIndex = stepIndex;
  }
};

/** returns the index the form should start on, for new questionary it's 0,
 * but for unfinished it's the first unfinished step */
function getInitialStepIndex(steps: QuestionaryStep[]): number {
  const lastFinishedStep = steps
    .slice()
    .reverse()
    .find(step => step.isCompleted === true);

  if (!lastFinishedStep) {
    return 0;
  }

  const lastFinishedStepIndex = steps.indexOf(lastFinishedStep);
  const nextUnfinishedStep = lastFinishedStepIndex + 1;
  const maxStepIndex = steps.length - 1;

  return clamp(nextUnfinishedStep, 0, maxStepIndex);
}
export function QuestionarySubmissionModel<
  T extends QuestionarySubmissionState
>(
  initialState: T,
  middlewares?: Array<ReducerMiddleware<T, Event>>,
  reducers?: (state: T, draftState: T, action: Event) => T
) {
  function reducer(state: T, action: Event) {
    return produce(state, draftState => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.steps,
            action.payload.id
          ) as Answer;
          field.value = action.payload.newValue;
          draftState.isDirty = true;
          break;

        case EventType.QUESTIONARY_STEPS_COMPLETE:
          draftState.isDirty = false;
          break;

        case EventType.GO_STEP_BACK:
          setStepIndexIfValid(draftState, draftState.stepIndex - 1);
          break;

        case EventType.GO_STEP_FORWARD:
          setStepIndexIfValid(draftState, draftState.stepIndex + 1);
          break;

        case EventType.GO_TO_STEP:
          setStepIndexIfValid(draftState, action.payload.stepIndex);
          break;

        case EventType.QUESTIONARY_STEPS_LOADED: {
          draftState.steps = action.payload.questionarySteps;
          const stepIndex =
            action.payload.stepIndex !== undefined
              ? action.payload.stepIndex
              : getInitialStepIndex(action.payload.questionarySteps);
          draftState.stepIndex = stepIndex;
          draftState.isDirty = false;
          break;
        }
        case EventType.QUESTIONARY_STEP_ANSWERED:
          const updatedStep = action.payload.questionaryStep as QuestionaryStep;
          const stepIndex = draftState.steps.findIndex(
            step => step.topic.id === updatedStep.topic.id
          );
          draftState.steps[stepIndex] = updatedStep;

          draftState.isDirty = false;

          break;
      }

      // @ts-ignore-line
      draftState = reducers?.(state, draftState, action) || draftState;
    });
  }

  const [modelState, dispatch] = useReducerWithMiddleWares<Reducer<T, Event>>(
    reducer,
    initialState,
    middlewares || []
  );

  return { state: modelState as T, dispatch };
}
