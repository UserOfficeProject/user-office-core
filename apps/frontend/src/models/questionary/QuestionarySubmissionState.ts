/* eslint-disable @typescript-eslint/no-explicit-any */
import produce, { Draft } from 'immer';
import { Reducer } from 'react';

import { StepsWizardWithoutReviewStepFactory } from 'components/questionary/questionaries/sample/StepsWizardWithoutReviewStepFactory';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { GenericTemplateFragment, Maybe, TemplateGroupId } from 'generated/sdk';
import { Answer, Questionary, QuestionaryStep } from 'generated/sdk';
import { deepClone } from 'utils/json';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';
import { WithConfirmType } from 'utils/withConfirm';

import { SampleFragment } from './../../generated/sdk';
import { getFieldById } from './QuestionaryFunctions';
import { SampleEsiWithQuestionary } from './sampleEsi/SampleEsiWithQuestionary';
import { StepType } from './StepType';

export enum GENERIC_TEMPLATE_EVENT {
  ITEMS_MODIFIED = 'ITEMS_MODIFIED',
  ITEMS_DELETED = 'ITEMS_DELETED',
}
export type Event =
  | { type: 'FIELD_CHANGED'; id: string; newValue: any }
  | { type: 'BACK_CLICKED'; confirm?: WithConfirmType }
  | { type: 'RESET_CLICKED'; confirm?: WithConfirmType }
  | {
      type: 'GO_TO_STEP_CLICKED';
      stepIndex: number;
      confirm?: WithConfirmType;
    }
  | { type: 'GO_STEP_BACK' }
  | { type: 'GO_STEP_FORWARD' }
  | { type: 'CLEAN_DIRTY_STATE' }
  | { type: 'CLEAR_DELETE_LIST' }
  | { type: 'CLEAR_CREATED_LIST' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'STEPS_LOADED'; steps: QuestionaryStep[]; stepIndex?: number }
  | { type: 'STEP_ANSWERED'; step: QuestionaryStep }
  // item with questionary
  | {
      type: 'ITEM_WITH_QUESTIONARY_CREATED';
      itemWithQuestionary: { questionary: Questionary };
    }
  | {
      type: 'ITEM_WITH_QUESTIONARY_LOADED';
      itemWithQuestionary: { questionary: Questionary };
    }
  | {
      type: 'ITEM_WITH_QUESTIONARY_MODIFIED';
      itemWithQuestionary: Record<string, unknown>;
    }
  | {
      type: 'ITEM_WITH_QUESTIONARY_SUBMITTED';
      itemWithQuestionary: Record<string, unknown>;
    }
  // sample
  | { type: 'ESI_SAMPLE_CREATED'; sample: SampleFragment }
  | { type: 'ESI_SAMPLE_DELETED'; sampleId: number }
  | {
      type: 'ESI_ITEM_WITH_QUESTIONARY_CREATED';
      sampleEsi: SampleEsiWithQuestionary;
    }
  | { type: 'ESI_SAMPLE_ESI_UPDATED'; sampleEsi: SampleEsiWithQuestionary }
  | { type: 'ESI_SAMPLE_ESI_DELETED'; sampleId: number }
  | {
      type: 'SAMPLE_DECLARATION_ITEMS_MODIFIED';
      id: string;
      newItems: Maybe<
        (SampleFragment & {
          questionary: Pick<Questionary, 'isCompleted'>;
        })[]
      >;
    }
  | {
      type: GENERIC_TEMPLATE_EVENT;
      id: string;
      newItems: Maybe<
        (GenericTemplateFragment & {
          questionary: Pick<Questionary, 'isCompleted'>;
        })[]
      >;
    };

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

export interface ItemWithQuestionary {
  questionary: Questionary;
}
const clamStepIndex = (stepIndex: number, stepCount: number) => {
  const minStepIndex = 0;
  const maxStepIndex = stepCount - 1;

  return clamp(stepIndex, minStepIndex, maxStepIndex);
};

export abstract class QuestionarySubmissionState {
  constructor(
    public templateGroupId: TemplateGroupId,
    public initItem: ItemWithQuestionary,
    public isPreviewMode?: boolean,
    public wizardSteps: WizardStep[] = isPreviewMode
      ? new StepsWizardWithoutReviewStepFactory().getWizardSteps(
          initItem.questionary.steps
        )
      : getQuestionaryDefinition(
          templateGroupId
        ).wizardStepFactory.getWizardSteps(initItem.questionary.steps),
    public stepIndex: number = 0,
    public isDirty: boolean = false,
    public deletedTemplates: number[] = [],
    public createdTemplates: number[] = []
  ) {
    this.initItem = deepClone(initItem); // save initial data to restore it if reset is clicked
  }

  /**
   * Returns item that has questionary associated with it
   */
  abstract itemWithQuestionary: ItemWithQuestionary;

  /**
   * Unique id of the item
   */
  abstract getItemId(): number | [number, number];

  get questionary() {
    return this.itemWithQuestionary.questionary;
  }

  set questionary(questionary) {
    this.itemWithQuestionary.questionary = questionary;
  }

  /** returns the index the form should start on, for new questionary it's 0,
   * but for unfinished it's the first unfinished step */
  getInitialStepIndex(): number {
    const wizardSteps = this.wizardSteps;
    const lastFinishedStep = this.wizardSteps
      .slice()
      .reverse()
      .find(
        (step) => step.getMetadata(this, step.payload).isCompleted === true
      );

    if (!lastFinishedStep) {
      return 0;
    }

    const lastFinishedStepIndex = wizardSteps.indexOf(lastFinishedStep);
    const nextUnfinishedStep = lastFinishedStepIndex + 1;

    return clamStepIndex(nextUnfinishedStep, wizardSteps.length);
  }
}

export function QuestionarySubmissionModel<
  T extends QuestionarySubmissionState,
>(
  initialState: T,
  middlewares?: Array<ReducerMiddleware<T, Event>>,
  reducers?: (state: T, draftState: T, action: Event) => T
) {
  function reducer(state: T, action: Event) {
    return produce(state, (draftState) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_CREATED':
        case 'ITEM_WITH_QUESTIONARY_LOADED':
          draftState.isDirty = false;
          draftState.itemWithQuestionary = action.itemWithQuestionary;
          break;
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          draftState.itemWithQuestionary = {
            ...draftState.itemWithQuestionary,
            ...action.itemWithQuestionary,
          };
          draftState.isDirty = true;
          break;
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
        case 'CLEAR_DELETE_LIST':
          draftState.deletedTemplates = [];
          break;
        case 'CLEAR_CREATED_LIST':
          draftState.createdTemplates = [];
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
          // TODO: Here we can also mark the step as completed after going to next step
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
              : draftState.getInitialStepIndex();
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
