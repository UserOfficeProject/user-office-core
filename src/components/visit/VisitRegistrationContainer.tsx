/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { TemplateGroupId } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';
import { RegistrationWithQuestionary } from 'models/questionary/visit/VisitRegistrationWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';
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
      draftState.itemWithQuestionary = visit;
      break;
    case 'REGISTRATION_MODIFIED':
      draftState.registration = {
        ...draftState.registration,
        ...action.visit,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export interface VisitRegistrationContainerProps {
  registration: RegistrationWithQuestionary;
  onCreate?: (registration: RegistrationWithQuestionary) => void;
  onUpdate?: (registration: RegistrationWithQuestionary) => void;
  onSubmitted?: (registration: RegistrationWithQuestionary) => void;
}
export default function VisitRegistrationContainer(
  props: VisitRegistrationContainerProps
) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.VISIT_REGISTRATION);

  const previousInitialVisit = usePrevious(props.registration);

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
          props.onSubmitted?.(state.registration);
          break;
      }
    };
  };
  const initialState = new VisitRegistrationSubmissionState(
    props.registration,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.registration.questionary.steps)
  );

  const { state, dispatch } =
    QuestionarySubmissionModel<VisitRegistrationSubmissionState>(
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
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
