/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { QuestionaryStep, VisitRegistrationFragment } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import {
  RegistrationExtended,
  VisitSubmissionState as VisitRegistrationSubmissionState,
} from 'models/VisitSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import VisitRegistrationReview from './VisitRegistrationReview';

export interface VisitRegistrationContextType extends QuestionaryContextType {
  state: VisitRegistrationSubmissionState | null;
}

const visitReducer = (
  state: VisitRegistrationSubmissionState,
  draftState: VisitRegistrationSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'REGISTRATION_CREATED':
    case 'REGISTRATION_LOADED':
      const visit = action.visit;
      draftState.isDirty = false;
      draftState.questionaryId = visit.registrationQuestionaryId;
      draftState.registration = visit;
      draftState.steps = visit.questionary!.steps;
      draftState.templateId = visit.questionary!.templateId;
      break;
    case 'REGISTRATION_MODIFIED':
      draftState.registration = {
        ...draftState.registration,
        ...action.visit,
      };
      draftState.isDirty = true;
      break;
    case 'STEPS_LOADED': {
      draftState.registration.questionary!.steps = action.steps;
      break;
    }
    case 'STEP_ANSWERED':
      const updatedStep = action.step;
      const stepIndex = draftState.registration.questionary!.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.registration.questionary!.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const isRegistrationSubmitted = (
  registration: Pick<VisitRegistrationFragment, 'isRegistrationSubmitted'>
) => registration.isRegistrationSubmitted;

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const visitState = state as VisitRegistrationSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        isRegistrationSubmitted(visitState.registration) ||
        (index > 0 && state.steps[index - 1].isCompleted === false),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'VisitReview',
  getMetadata: (state) => {
    const visitState = state as VisitRegistrationSubmissionState;

    return {
      title: 'Review',
      isCompleted: isRegistrationSubmitted(visitState.registration),
      isReadonly: false,
    };
  },
});

export interface VisitRegistrationContainerProps {
  registration: RegistrationExtended;
  onCreate?: (registration: RegistrationExtended) => void;
  onUpdate?: (registration: RegistrationExtended) => void;
  onSubmitted?: (registration: RegistrationExtended) => void;
}
export default function VisitRegistrationContainer(
  props: VisitRegistrationContainerProps
) {
  const { api } = useDataApiWithFeedback();

  const previousInitialVisit = usePrevious(props.registration);

  const createVisitWizardSteps = (): WizardStep[] => {
    if (!props.registration) {
      return [];
    }
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.registration.questionary!.steps;

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
        return <VisitRegistrationReview />;

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const registrationState = state as VisitRegistrationSubmissionState;

    if (registrationState.registration.registrationQuestionaryId === 0) {
      // if visit is not created yet
      dispatch({
        type: 'REGISTRATION_LOADED',
        visit: initialState.registration,
      });
    } else {
      await api()
        .getVisitRegistration({
          visitId: registrationState.registration.visitId,
        }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (
            data.visitRegistration &&
            data.visitRegistration.questionary!.steps
          ) {
            dispatch({
              type: 'REGISTRATION_LOADED',
              visit: data.visitRegistration,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.visitRegistration.questionary!.steps,
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
      const state = getState() as VisitRegistrationSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'REGISTRATION_CREATED':
          props.onCreate?.(state.registration);
          break;

        case 'REGISTRATION_MODIFIED':
          props.onUpdate?.(state.registration);
          break;

        case 'REGISTRATION_SUBMITTED':
          console.log(props.onSubmitted);
          props.onSubmitted?.(state.registration);
          break;
      }
    };
  };
  const initialState: VisitRegistrationSubmissionState = {
    registration: props.registration,
    templateId: props.registration.questionary!.templateId,
    isDirty: false,
    questionaryId: props.registration.questionary!.questionaryId,
    stepIndex: 0,
    steps: props.registration.questionary!.steps,
    wizardSteps: createVisitWizardSteps(),
  };

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<VisitRegistrationSubmissionState>(
    initialState,
    [handleEvents],
    visitReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialVisit === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'REGISTRATION_LOADED',
        visit: props.registration,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.registration.questionary!.steps,
      });
    }
  }, [previousInitialVisit, props.registration, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Visit the facility'}
        handleReset={handleReset}
        displayElementFactory={displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
