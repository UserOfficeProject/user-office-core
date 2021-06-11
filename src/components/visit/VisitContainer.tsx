/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { QuestionaryStep, VisitStatus } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import {
  VisitExtended,
  VisitSubmissionState,
} from 'models/VisitSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import VisitReview from './VisitReview';

export interface VisitContextType extends QuestionaryContextType {
  state: VisitSubmissionState | null;
}

const visitReducer = (
  state: VisitSubmissionState,
  draftState: VisitSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'VISIT_CREATED':
    case 'VISIT_LOADED':
      const visit = action.visit;
      draftState.isDirty = false;
      draftState.questionaryId = visit.questionaryId;
      draftState.visit = visit;
      draftState.steps = visit.questionary.steps;
      draftState.templateId = visit.questionary.templateId;
      break;
    case 'VISIT_MODIFIED':
      draftState.visit = {
        ...draftState.visit,
        ...action.visit,
      };
      draftState.isDirty = true;
      break;
    case 'STEPS_LOADED': {
      draftState.visit.questionary.steps = action.steps;
      break;
    }
    case 'STEP_ANSWERED':
      const updatedStep = action.step;
      const stepIndex = draftState.visit.questionary.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.visit.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const isVisitSubmitted = (visit: { status: VisitStatus }) =>
  visit.status === VisitStatus.SUBMITTED;

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const visitState = state as VisitSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        isVisitSubmitted(visitState.visit) ||
        (index > 0 && state.steps[index - 1].isCompleted === false),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'VisitReview',
  getMetadata: (state) => {
    const visitState = state as VisitSubmissionState;

    return {
      title: 'Review',
      isCompleted: isVisitSubmitted(visitState.visit),
      isReadonly: false,
    };
  },
});

export interface VisitContainerProps {
  visit: VisitExtended;
  onCreate?: (visit: VisitExtended) => void;
  onUpdate?: (visit: VisitExtended) => void;
}
export default function VisitContainer(props: VisitContainerProps) {
  const { api } = useDataApiWithFeedback();

  const previousInitialVisit = usePrevious(props.visit);

  const createVisitWizardSteps = (): WizardStep[] => {
    if (!props.visit) {
      return [];
    }
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.visit.questionary.steps;

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(createQuestionaryWizardStep(step, index))
    );

    wizardSteps.push(createReviewWizardStep());

    return wizardSteps;
  };

  const displayElementFactory = (metadata: WizardStep, isReadonly: boolean) => {
    switch (metadata.type) {
      case 'QuestionaryStep':
        return (
          <QuestionaryStepView
            readonly={isReadonly}
            topicId={metadata.payload.topicId}
          />
        );
      case 'VisitReview':
        return <VisitReview />;

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const visitState = state as VisitSubmissionState;

    if (visitState.visit.id === 0) {
      // if visit is not created yet
      dispatch({
        type: 'VISIT_LOADED',
        visit: initialState.visit,
      });
    } else {
      await api()
        .getVisit({ visitId: visitState.visit.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.visit && data.visit.questionary.steps) {
            dispatch({
              type: 'VISIT_LOADED',
              visit: data.visit,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.visit.questionary.steps,
              stepIndex: state.stepIndex,
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
      next(action); // first update state/model
      const state = getState() as VisitSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'VISIT_CREATED':
          props.onCreate?.(state.visit);
          break;

        case 'VISIT_MODIFIED':
          props.onUpdate?.(state.visit);
          break;
      }
    };
  };
  const initialState: VisitSubmissionState = {
    visit: props.visit,
    templateId: props.visit.questionary.templateId,
    isDirty: false,
    questionaryId: props.visit.questionary.questionaryId,
    stepIndex: 0,
    steps: props.visit.questionary.steps,
    wizardSteps: createVisitWizardSteps(),
  };

  const { state, dispatch } = QuestionarySubmissionModel<VisitSubmissionState>(
    initialState,
    [handleEvents],
    visitReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialVisit === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'VISIT_LOADED',
        visit: props.visit,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.visit.questionary.steps,
      });
    }
  }, [previousInitialVisit, props.visit, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Visit the facility'}
        info={state.visit.status}
        handleReset={handleReset}
        displayElementFactory={displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
