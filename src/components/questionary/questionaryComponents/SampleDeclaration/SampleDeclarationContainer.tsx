/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { QuestionaryStep } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import { SampleWithQuestionary } from 'models/Sample';
import { SampleSubmissionState } from 'models/SampleSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface SampleContextType extends QuestionaryContextType {
  state: SampleSubmissionState | null;
}

const samplesReducer = (
  state: SampleSubmissionState,
  draftState: SampleSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.SAMPLE_CREATED:
    case EventType.SAMPLE_LOADED:
      const sample: SampleWithQuestionary = action.payload.sample;
      draftState.isDirty = false;
      draftState.questionaryId = sample.questionaryId;
      draftState.sample = sample;
      draftState.steps = sample.questionary.steps;
      draftState.templateId = sample.questionary.templateId;
      break;
    case EventType.SAMPLE_MODIFIED:
      draftState.sample = {
        ...draftState.sample,
        ...action.payload,
      };
      draftState.isDirty = true;
      break;

    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.sample.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED:
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.sample.questionary.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.sample.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly: index > 0 && state.steps[index - 1].isCompleted === false,
    };
  },
});

export function SampleDeclarationContainer(props: {
  sample: SampleWithQuestionary;
  sampleCreated?: (sample: SampleWithQuestionary) => void;
  sampleUpdated?: (sample: SampleWithQuestionary) => void;
  sampleEditDone?: () => void;
}) {
  const { api } = useDataApiWithFeedback();

  const previousInitialSample = usePrevious(props.sample);

  const createSampleWizardSteps = (): WizardStep[] => {
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.sample.questionary.steps;

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(createQuestionaryWizardStep(step, index))
    );

    return wizardSteps;
  };

  const isLastStep = (wizardStep: WizardStep) =>
    state.wizardSteps[state.wizardSteps.length - 1] === wizardStep;

  const displayElementFactory = (
    wizardStep: WizardStep,
    isReadonly: boolean
  ) => {
    return (
      <QuestionaryStepView
        readonly={isReadonly}
        topicId={wizardStep.payload.topicId}
        onStepComplete={() => {
          if (isLastStep(wizardStep)) {
            props.sampleEditDone?.();
          }
        }}
      />
    );
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const sampleState = state as SampleSubmissionState;
    if (sampleState.sample.id === 0) {
      // if sample isn't created yet
      dispatch({
        type: EventType.SAMPLE_LOADED,
        payload: { sample: initialState.sample },
      });
    } else {
      await api()
        .getSample({ sampleId: sampleState.sample.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.sample && data.sample.questionary.steps) {
            dispatch({
              type: EventType.SAMPLE_LOADED,
              payload: { sample: data.sample },
            });
            dispatch({
              type: EventType.QUESTIONARY_STEPS_LOADED,
              payload: {
                questionarySteps: data.sample.questionary.steps,
                stepIndex: state.stepIndex,
              },
            });
          }
        });
    }

    return true;
  };

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: FunctionType) => async (action: Event) => {
      next(action);
      const state = getState() as SampleSubmissionState;
      switch (action.type) {
        case EventType.SAMPLE_UPDATED:
          props.sampleUpdated?.(action.payload.sample);
          break;
        case EventType.SAMPLE_CREATED:
          props.sampleCreated?.(action.payload.sample);
          break;
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;
        case EventType.RESET_CLICKED:
          handleReset();
          break;
      }
    };
  };

  const initialState: SampleSubmissionState = {
    sample: props.sample,
    templateId: props.sample.questionary.templateId,
    isDirty: false,
    questionaryId: props.sample.questionary.questionaryId,
    stepIndex: 0,
    steps: props.sample.questionary.steps,
    wizardSteps: createSampleWizardSteps(),
  };

  const { state, dispatch } = QuestionarySubmissionModel<SampleSubmissionState>(
    initialState,
    [handleEvents],
    samplesReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialSample === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: EventType.SAMPLE_LOADED,
        payload: { sample: props.sample },
      });
      dispatch({
        type: EventType.QUESTIONARY_STEPS_LOADED,
        payload: { questionarySteps: props.sample.questionary.steps },
      });
    }
  }, [previousInitialSample, props.sample, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.sample.title || 'New Sample'}
        handleReset={handleReset}
        displayElementFactory={displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
