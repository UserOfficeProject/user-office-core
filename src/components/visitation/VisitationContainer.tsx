/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { QuestionaryStep, VisitationStatus } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import {
  VisitationExtended,
  VisitationSubmissionState,
} from 'models/VisitationSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import VisitationReview from './VisitationReview';

export interface VisitationContextType extends QuestionaryContextType {
  state: VisitationSubmissionState | null;
}

const visitationReducer = (
  state: VisitationSubmissionState,
  draftState: VisitationSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.VISITATION_CREATED:
    case EventType.VISITATION_LOADED:
      const visitation: VisitationExtended = action.payload.visitation;
      draftState.isDirty = false;
      draftState.questionaryId = visitation.questionaryId;
      draftState.visitation = visitation;
      draftState.steps = visitation.questionary.steps;
      draftState.templateId = visitation.questionary.templateId;
      break;
    case EventType.VISITATION_MODIFIED:
      draftState.visitation = {
        ...draftState.visitation,
        ...action.payload.visitation,
      };
      draftState.isDirty = true;
      break;
    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.visitation.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED:
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.visitation.questionary.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.visitation.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const isVisitationSubmitted = (visitation: { status: VisitationStatus }) =>
  visitation.status === VisitationStatus.SUBMITTED;

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const visitationState = state as VisitationSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        isVisitationSubmitted(visitationState.visitation) ||
        (index > 0 && state.steps[index - 1].isCompleted === false),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'VisitationReview',
  getMetadata: (state) => {
    const visitationState = state as VisitationSubmissionState;

    return {
      title: 'Review',
      isCompleted: isVisitationSubmitted(visitationState.visitation),
      isReadonly: false,
    };
  },
});

export interface VisitationContainerProps {
  visitation: VisitationExtended;
  onCreate?: (visitation: VisitationExtended) => void;
  onUpdate?: (visitation: VisitationExtended) => void;
}
export default function VisitationContainer(props: VisitationContainerProps) {
  const { api } = useDataApiWithFeedback();

  const previousInitialVisitation = usePrevious(props.visitation);

  const createVisitationWizardSteps = (): WizardStep[] => {
    if (!props.visitation) {
      return [];
    }
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.visitation.questionary.steps;

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
      case 'VisitationReview':
        return <VisitationReview />;

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const visitationState = state as VisitationSubmissionState;

    if (visitationState.visitation.id === 0) {
      // if visitation is not created yet
      dispatch({
        type: EventType.VISITATION_LOADED,
        payload: { visitation: initialState.visitation },
      });
    } else {
      await api()
        .getVisitation({ visitationId: visitationState.visitation.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.visitation && data.visitation.questionary.steps) {
            dispatch({
              type: EventType.VISITATION_LOADED,
              payload: { visitation: data.visitation },
            });
            dispatch({
              type: EventType.QUESTIONARY_STEPS_LOADED,
              payload: {
                questionarySteps: data.visitation.questionary.steps,
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
      next(action); // first update state/model
      const state = getState() as VisitationSubmissionState;
      switch (action.type) {
        case EventType.BACK_CLICKED: // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;

        case EventType.VISITATION_CREATED:
          props.onCreate?.(state.visitation);
          break;

        case EventType.VISITATION_MODIFIED:
          props.onUpdate?.(state.visitation);
          break;
      }
    };
  };
  const initialState: VisitationSubmissionState = {
    visitation: props.visitation,
    templateId: props.visitation.questionary.templateId,
    isDirty: false,
    questionaryId: props.visitation.questionary.questionaryId,
    stepIndex: 0,
    steps: props.visitation.questionary.steps,
    wizardSteps: createVisitationWizardSteps(),
  };

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<VisitationSubmissionState>(
    initialState,
    [handleEvents],
    visitationReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialVisitation === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: EventType.VISITATION_LOADED,
        payload: { visitation: props.visitation },
      });
      dispatch({
        type: EventType.QUESTIONARY_STEPS_LOADED,
        payload: { questionarySteps: props.visitation.questionary.steps },
      });
    }
  }, [previousInitialVisitation, props.visitation, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Visitation'}
        info={state.visitation.status}
        handleReset={handleReset}
        displayElementFactory={displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
