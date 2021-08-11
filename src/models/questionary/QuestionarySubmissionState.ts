/* eslint-disable @typescript-eslint/no-explicit-any */
import produce, { Draft } from 'immer';
import { Reducer } from 'react';

import { Answer, Questionary, QuestionaryStep } from 'generated/sdk';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

import { ProposalSubmissionState } from './proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from './proposal/ProposalWithQuestionary';
import { getFieldById } from './QuestionaryFunctions';
import { RiskAssessmentWithQuestionary as AssessmentWQ } from './riskAssessment/RiskAssessmentWithQuestionary';
import { SampleWithQuestionary } from './sample/SampleWithQuestionary';
import { ShipmentWithQuestionary } from './shipment/ShipmentWithQuestionary';
import { StepType } from './StepType';
import { RegistrationWithQuestionary as RegistrationWQ } from './visit/VisitRegistrationWithQuestionary';

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
  // sample
  | { type: 'SAMPLE_CREATED'; sample: SampleWithQuestionary }
  | { type: 'SAMPLE_LOADED'; sample: SampleWithQuestionary }
  | { type: 'SAMPLE_UPDATED'; sample: Partial<SampleWithQuestionary> }
  | { type: 'SAMPLE_MODIFIED'; sample: Partial<SampleWithQuestionary> }
  | { type: 'SAMPLE_SUBMITTED'; sample: Partial<SampleWithQuestionary> }
  // proposal
  | { type: 'PROPOSAL_CREATED'; proposal: ProposalWithQuestionary }
  | { type: 'PROPOSAL_LOADED'; proposal: ProposalWithQuestionary }
  | { type: 'PROPOSAL_MODIFIED'; proposal: Partial<ProposalWithQuestionary> }
  | { type: 'PROPOSAL_SUBMIT_CLICKED'; proposalPk: number }
  // shipment
  | { type: 'SHIPMENT_CREATED'; shipment: ShipmentWithQuestionary }
  | { type: 'SHIPMENT_LOADED'; shipment: ShipmentWithQuestionary }
  | { type: 'SHIPMENT_MODIFIED'; shipment: Partial<ShipmentWithQuestionary> }
  | { type: 'SHIPMENT_SUBMITTED'; shipment: Partial<ShipmentWithQuestionary> }
  // registration
  | { type: 'REGISTRATION_CREATED'; visit: RegistrationWQ }
  | { type: 'REGISTRATION_LOADED'; visit: RegistrationWQ }
  | { type: 'REGISTRATION_MODIFIED'; visit: Partial<RegistrationWQ> }
  | { type: 'REGISTRATION_SUBMITTED'; visit: Partial<RegistrationWQ> }
  // risk assessment
  | { type: 'RISK_ASSESSMENT_CREATED'; assessment: AssessmentWQ }
  | { type: 'RISK_ASSESSMENT_LOADED'; assessment: AssessmentWQ }
  | { type: 'RISK_ASSESSMENT_MODIFIED'; assessment: Partial<AssessmentWQ> }
  | { type: 'RISK_ASSESSMENT_SUBMITTED'; assessment: Partial<AssessmentWQ> };

export interface WizardStepMetadata {
  title: string;
  isCompleted: boolean;
  isReadonly: boolean;
}

export interface WizardStep {
  type: StepType;
  payload?: any;
  getMetadata: (
    state: QuestionarySubmissionState,
    payload?: any
  ) => WizardStepMetadata;
}

export abstract class QuestionarySubmissionState {
  constructor(
    public stepIndex: number,
    public isDirty: boolean,
    public wizardSteps: WizardStep[]
  ) {}
  abstract itemWithQuestionary: { questionary: Questionary };

  get questionary() {
    return this.itemWithQuestionary.questionary;
  }

  set questionary(questionary) {
    this.itemWithQuestionary.questionary = questionary;
  }
}

const clamStepIndex = (stepIndex: number, stepCount: number) => {
  const minStepIndex = 0;
  const maxStepIndex = stepCount - 1;

  return clamp(stepIndex, minStepIndex, maxStepIndex);
};

/** returns the index the form should start on, for new questionary it's 0,
 * but for unfinished it's the first unfinished step */
// TODO move getInitialStepIndex to the Questionary definition
function getInitialStepIndex(state: QuestionarySubmissionState): number {
  const wizardSteps = state.wizardSteps;
  const lastFinishedStep = state.wizardSteps
    .slice()
    .reverse()
    .find((step) => step.getMetadata(state, step.payload).isCompleted === true);

  if (
    (state as ProposalSubmissionState).proposal?.status?.shortCode.toString() ==
    'EDITABLE_SUBMITTED'
  ) {
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
        case 'FIELD_CHANGED':
          const field = getFieldById(
            draftState.questionary.steps,
            action.id
          ) as Answer;
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
          draftState.questionary.steps = action.steps;
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
          const stepIndex = draftState.questionary.steps.findIndex(
            (step) => step.topic.id === updatedStep.topic.id
          );
          draftState.questionary.steps[stepIndex] = updatedStep;

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
