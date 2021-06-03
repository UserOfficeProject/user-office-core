/* eslint-disable @typescript-eslint/no-explicit-any */
import produce, { Draft } from 'immer';
import { Reducer } from 'react';

import { Answer, QuestionaryStep } from 'generated/sdk';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

import { ProposalSubsetSubmission } from './ProposalSubmissionState';
import { getFieldById } from './QuestionaryFunctions';

export enum EventType {
  FIELD_CHANGED = 'FIELD_CHANGED',
  WIZARD_STEPS_COMPLETE = 'WIZARD_STEPS_COMPLETE',
  BACK_CLICKED = 'BACK_CLICKED',
  RESET_CLICKED = 'RESET_CLICKED',
  GO_STEP_BACK = 'GO_TO_STEP_REQUESTED',
  GO_STEP_FORWARD = 'GO_STEP_FORWARD',
  GO_TO_STEP = 'GO_TO_STEP',
  QUESTIONARY_STEPS_LOADED = 'QUESTIONARY_STEPS_LOADED',
  QUESTIONARY_STEP_ANSWERED = 'QUESTIONARY_STEP_ANSWERED',
  SAVE_AND_CONTINUE_CLICKED = 'SAVE_AND_CONTINUE_CLICKED',
  SAMPLE_CREATED = 'SAMPLE_CREATED',
  SAMPLE_UPDATED = 'SAMPLE_UPDATED',
  SAMPLE_LOADED = 'SAMPLE_LOADED',
  SAMPLE_MODIFIED = 'SAMPLE_MODIFIED',
  SAVE_GENERAL_INFO_CLICKED = 'SAVE_GENERAL_INFO_CLICKED',
  PROPOSAL_MODIFIED = 'PROPOSAL_MODIFIED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_LOADED = 'PROPOSAL_LOADED',
  PROPOSAL_SUBMIT_CLICKED = 'PROPOSAL_SUBMIT_CLICKED',
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  SHIPMENT_LOADED = 'SHIPMENT_LOADED',
  SHIPMENT_MODIFIED = 'SHIPMENT_MODIFIED',
  SHIPMENT_DONE = 'SHIPMENT_DONE',
  CLEAN_DIRTY_STATE = 'CLEAN_DIRTY_STATE',
  VISITATION_CREATED = 'VISITATION_CREATED',
  VISITATION_LOADED = 'VISITATION_LOADED',
  VISITATION_MODIFIED = 'VISITATION_MODIFIED',
}
export interface Event {
  type: EventType;
  payload?: any;
}

export interface WizardStepMetadata {
  title: string;
  isCompleted: boolean;
  isReadonly: boolean;
}

export interface WizardStep {
  type:
    | 'QuestionaryStep'
    | 'ProposalReview'
    | 'ShipmentReview'
    | 'VisitationReview';
  payload?: any;
  getMetadata: (
    state: QuestionarySubmissionState,
    payload?: any
  ) => WizardStepMetadata;
}

export interface QuestionarySubmissionState {
  questionaryId: number | null; // null if questionary not created yet
  steps: QuestionaryStep[]; // blank of filled out steps. If blank, then questionaryId will be null
  templateId: number;
  stepIndex: number;
  isDirty: boolean;
  wizardSteps: WizardStep[];
  proposal?: ProposalSubsetSubmission;
}

const clamStepIndex = (stepIndex: number, stepCount: number) => {
  const minStepIndex = 0;
  const maxStepIndex = stepCount - 1;

  return clamp(stepIndex, minStepIndex, maxStepIndex);
};

/** returns the index the form should start on, for new questionary it's 0,
 * but for unfinished it's the first unfinished step */
function getInitialStepIndex(state: QuestionarySubmissionState): number {
  const wizardSteps = state.wizardSteps;
  const lastFinishedStep = state.wizardSteps
    .slice()
    .reverse()
    .find((step) => step.getMetadata(state, step.payload).isCompleted === true);

  if (state.proposal?.status?.shortCode.toString() == 'EDITABLE_SUBMITTED') {
    return 0;
  }
  if (!lastFinishedStep) {
    return 0;
  }

  const lastFinishedStepIndex = wizardSteps.indexOf(lastFinishedStep);
  const nextUnfinishedStep = lastFinishedStepIndex + 1;

  return clamStepIndex(nextUnfinishedStep, wizardSteps.length);
}

export function QuestionarySubmissionModel<
  T extends QuestionarySubmissionState
>(
  initialState: T,
  middlewares?: Array<ReducerMiddleware<T, Event>>,
  reducers?: (state: T, draftState: T, action: Event) => T
) {
  function reducer(state: T, action: Event) {
    return produce(state, (draftState) => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.steps,
            action.payload.id
          ) as Answer;
          field.value = action.payload.newValue;
          draftState.isDirty = true;
          break;

        case EventType.CLEAN_DIRTY_STATE:
          draftState.isDirty = false;
          break;

        case EventType.GO_STEP_BACK:
          draftState.stepIndex = clamStepIndex(
            draftState.stepIndex - 1,
            draftState.wizardSteps.length
          );

          break;

        case EventType.GO_STEP_FORWARD:
          draftState.stepIndex = clamStepIndex(
            draftState.stepIndex + 1,
            draftState.wizardSteps.length
          );
          break;

        case EventType.GO_TO_STEP:
          draftState.stepIndex = clamStepIndex(
            action.payload.stepIndex,
            draftState.wizardSteps.length
          );

          break;

        case EventType.QUESTIONARY_STEPS_LOADED: {
          draftState.steps = action.payload.questionarySteps;
          const stepIndex =
            action.payload.stepIndex !== undefined
              ? action.payload.stepIndex
              : getInitialStepIndex(draftState);
          draftState.stepIndex = stepIndex;
          draftState.isDirty = false;
          break;
        }
        case EventType.QUESTIONARY_STEP_ANSWERED:
          const updatedStep = action.payload.questionaryStep as QuestionaryStep;
          const stepIndex = draftState.steps.findIndex(
            (step) => step.topic.id === updatedStep.topic.id
          );
          draftState.steps[stepIndex] = updatedStep;

          draftState.isDirty = false;

          break;
      }

      (draftState as T | Draft<T>) =
        reducers?.(state, draftState as T, action) || draftState;
    });
  }

  const [modelState, dispatch] = useReducerWithMiddleWares<Reducer<T, Event>>(
    reducer,
    initialState,
    middlewares || []
  );

  return { state: modelState as T, dispatch };
}
