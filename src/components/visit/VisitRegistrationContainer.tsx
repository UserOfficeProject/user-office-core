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
    const registrationState = state;

    if (registrationState.registration.registrationQuestionaryId === 0) {
      // if visit is not created yet
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: initialState.registration,
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
              type: 'ITEM_WITH_QUESTIONARY_LOADED',
              itemWithQuestionary: data.visitRegistration,
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

        case 'ITEM_WITH_QUESTIONARY_CREATED':
          props.onCreate?.(state.registration);
          break;

        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          props.onUpdate?.(state.registration);
          break;

        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
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
    QuestionarySubmissionModel<VisitRegistrationSubmissionState>(initialState, [
      handleEvents,
    ]);

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialVisit === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: props.registration,
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
