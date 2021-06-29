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
import { SampleWithQuestionary } from './Sample';
import { ShipmentExtended } from './ShipmentSubmissionState';
import { VisitExtended } from './VisitSubmissionState';

export type Event =
  | { type: 'FIELD_CHANGED'; id: string; newValue: any }
  | { type: 'BACK_CLICKED' }
  | { type: 'RESET_CLICKED' }
  | { type: 'GO_STEP_BACK' }
  | { type: 'GO_STEP_FORWARD' }
  | { type: 'CLEAN_DIRTY_STATE' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'STEPS_LOADED'; steps: QuestionaryStep[]; stepIndex?: number }
  | { type: 'STEP_ANSWERED'; step: QuestionaryStep }
  | { type: 'SAMPLE_CREATED'; sample: SampleWithQuestionary }
  | { type: 'SAMPLE_UPDATED'; sample: Partial<SampleWithQuestionary> }
  | { type: 'SAMPLE_LOADED'; sample: SampleWithQuestionary }
  | { type: 'SAMPLE_MODIFIED'; sample: Partial<SampleWithQuestionary> }
  | { type: 'PROPOSAL_MODIFIED'; proposal: Partial<ProposalSubsetSubmission> }
  | { type: 'PROPOSAL_CREATED'; proposal: ProposalSubsetSubmission }
  | { type: 'PROPOSAL_LOADED'; proposal: ProposalSubsetSubmission }
  | { type: 'PROPOSAL_SUBMIT_CLICKED'; proposalPk: number }
  | { type: 'SHIPMENT_CREATED'; shipment: ShipmentExtended }
  | { type: 'SHIPMENT_LOADED'; shipment: ShipmentExtended }
  | { type: 'SHIPMENT_MODIFIED'; shipment: Partial<ShipmentExtended> }
  | { type: 'VISIT_CREATED'; visit: VisitExtended }
  | { type: 'VISIT_LOADED'; visit: VisitExtended }
  | { type: 'VISIT_MODIFIED'; visit: Partial<VisitExtended> };

export interface WizardStepMetadata {
  title: string;
  isCompleted: boolean;
  isReadonly: boolean;
}

export interface WizardStep {
  type: 'QuestionaryStep' | 'ProposalReview' | 'ShipmentReview' | 'VisitReview';
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
        case 'FIELD_CHANGED':
          const field = getFieldById(draftState.steps, action.id) as Answer;
          field.value = action.newValue;
          draftState.isDirty = true;
          break;

        case 'CLEAN_DIRTY_STATE':
          draftState.isDirty = false;
          break;

        case 'GO_STEP_BACK':
          draftState.stepIndex = clamStepIndex(
            draftState.stepIndex - 1,
            draftState.wizardSteps.length
          );

          break;

        case 'GO_STEP_FORWARD':
          draftState.stepIndex = clamStepIndex(
            draftState.stepIndex + 1,
            draftState.wizardSteps.length
          );
          break;

        case 'GO_TO_STEP':
          draftState.stepIndex = clamStepIndex(
            action.stepIndex,
            draftState.wizardSteps.length
          );

          break;

        case 'STEPS_LOADED': {
          draftState.steps = action.steps;
          const stepIndex =
            action.stepIndex !== undefined
              ? action.stepIndex
              : getInitialStepIndex(draftState);
          draftState.stepIndex = stepIndex;
          draftState.isDirty = false;
          break;
        }
        case 'STEP_ANSWERED':
          const updatedStep = action.step;
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
