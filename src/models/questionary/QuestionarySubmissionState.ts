/* eslint-disable @typescript-eslint/no-explicit-any */
import produce, { Draft } from 'immer';
import { Reducer } from 'react';

import { Answer, Questionary, QuestionaryStep } from 'generated/sdk';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

import { SampleFragment } from './../../generated/sdk';
import { GenericTemplateWithQuestionary } from './genericTemplate/GenericTemplateWithQuestionary';
import { ProposalSubmissionState } from './proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from './proposal/ProposalWithQuestionary';
import { ProposalEsiWithQuestionary } from './proposalEsi/ProposalEsiWithQuestionary';
import { getFieldById } from './QuestionaryFunctions';
import { SampleWithQuestionary } from './sample/SampleWithQuestionary';
import { SampleEsiWithQuestionary } from './sampleEsi/SampleEsiWithQuestionary';
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
  // generic template
  | {
      type: 'GENERIC_TEMPLATE_CREATED';
      genericTemplate: GenericTemplateWithQuestionary;
    }
  | {
      type: 'GENERIC_TEMPLATE_LOADED';
      genericTemplate: GenericTemplateWithQuestionary;
    }
  | {
      type: 'GENERIC_TEMPLATE_UPDATED';
      genericTemplate: Partial<GenericTemplateWithQuestionary>;
    }
  | {
      type: 'GENERIC_TEMPLATE_MODIFIED';
      genericTemplate: Partial<GenericTemplateWithQuestionary>;
    }
  | {
      type: 'GENERIC_TEMPLATE_SUBMITTED';
      genericTemplate: Partial<GenericTemplateWithQuestionary>;
    }
  // esi
  | { type: 'ESI_CREATED'; esi: ProposalEsiWithQuestionary }
  | { type: 'ESI_LOADED'; esi: ProposalEsiWithQuestionary }
  | { type: 'ESI_MODIFIED'; esi: Partial<ProposalEsiWithQuestionary> }
  | { type: 'ESI_SUBMITTED'; esi: Partial<ProposalEsiWithQuestionary> }
  | { type: 'ESI_SAMPLE_CREATED'; sample: SampleFragment }
  | { type: 'ESI_SAMPLE_DELETED'; sampleId: number }
  // sample esi
  | { type: 'SAMPLE_ESI_CREATED'; esi: SampleEsiWithQuestionary }
  | { type: 'SAMPLE_ESI_LOADED'; esi: SampleEsiWithQuestionary }
  | { type: 'SAMPLE_ESI_MODIFIED'; esi: Partial<SampleEsiWithQuestionary> }
  | { type: 'SAMPLE_ESI_SUBMITTED'; esi: Partial<SampleEsiWithQuestionary> };

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
