/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { TemplateCategoryId } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import {
  RiskAssessmentSubmissionState,
  RiskAssessmentWithQuestionary,
} from 'models/RiskAssessmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface RiskAssessmentContextType extends QuestionaryContextType {
  state: RiskAssessmentSubmissionState | null;
}

const riskAssessmentReducer = (
  state: RiskAssessmentSubmissionState,
  draftState: RiskAssessmentSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'RISK_ASSESSMENT_CREATED':
    case 'RISK_ASSESSMENT_LOADED':
      const riskAssessment = action.riskAssessment;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = riskAssessment;
      break;
    case 'RISK_ASSESSMENT_MODIFIED':
      draftState.riskAssessment = {
        ...draftState.riskAssessment,
        ...action.riskAssessment,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export interface RiskAssessmentContainerProps {
  riskAssessment: RiskAssessmentWithQuestionary;
  onCreate?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
  onUpdate?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
  onSubmitted?: (riskAssessment: RiskAssessmentWithQuestionary) => void;
}
export default function RiskAssessmentContainer(
  props: RiskAssessmentContainerProps
) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateCategoryId.RISK_ASSESSMENT);

  const previousInitialRiskAssessment = usePrevious(props.riskAssessment);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const assessmentState = state as RiskAssessmentSubmissionState;

    if (assessmentState.riskAssessment.riskAssessmentId === 0) {
      // if riskAssessment is not created yet
      dispatch({
        type: 'RISK_ASSESSMENT_LOADED',
        riskAssessment: initialState.riskAssessment,
      });
    } else {
      await api()
        .getRiskAssessment({
          riskAssessmentId: assessmentState.riskAssessment.riskAssessmentId,
        }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.riskAssessment && data.riskAssessment.questionary!.steps) {
            dispatch({
              type: 'RISK_ASSESSMENT_LOADED',
              riskAssessment: data.riskAssessment,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.riskAssessment.questionary!.steps,
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
      const state = getState() as RiskAssessmentSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'RISK_ASSESSMENT_CREATED':
          break;

        case 'RISK_ASSESSMENT_MODIFIED':
          props.onUpdate?.(state.riskAssessment);
          break;

        case 'RISK_ASSESSMENT_SUBMITTED':
          props.onSubmitted?.(state.riskAssessment);
          break;
      }
    };
  };
  const initialState = new RiskAssessmentSubmissionState(
    props.riskAssessment,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.riskAssessment.questionary.steps)
  );

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<RiskAssessmentSubmissionState>(
    initialState,
    [handleEvents],
    riskAssessmentReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialRiskAssessment === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'RISK_ASSESSMENT_LOADED',
        riskAssessment: props.riskAssessment,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.riskAssessment.questionary!.steps,
      });
    }
  }, [previousInitialRiskAssessment, props.riskAssessment, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Risk assessment for the experiment'}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
