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
import { GenericTemplateSubmissionState } from 'models/questionary/genericTemplate/GenericTemplateSubmissionState';
import { GenericTemplateWithQuestionary } from 'models/questionary/genericTemplate/GenericTemplateWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface GenericTemplateContextType extends QuestionaryContextType {
  state: GenericTemplateSubmissionState | null;
}

const genericTemplatesReducer = (
  state: GenericTemplateSubmissionState,
  draftState: GenericTemplateSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'GENERIC_TEMPLATE_CREATED':
    case 'GENERIC_TEMPLATE_LOADED':
      draftState.isDirty = false;
      draftState.itemWithQuestionary = action.genericTemplate;
      break;
    case 'GENERIC_TEMPLATE_MODIFIED':
      draftState.genericTemplate = {
        ...draftState.genericTemplate,
        ...action.genericTemplate,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export function GenericTemplateContainer(props: {
  genericTemplate: GenericTemplateWithQuestionary;
  genericTemplateCreated?: (
    genericTemplate: GenericTemplateWithQuestionary
  ) => void;
  genericTemplateUpdated?: (
    genericTemplate: GenericTemplateWithQuestionary
  ) => void;
  genericTemplateEditDone?: () => void;
  title: string;
}) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.GENERIC_TEMPLATE);

  const previousInitialGenericTemplate = usePrevious(props.genericTemplate);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const genericTemplateState = state as GenericTemplateSubmissionState;
    if (genericTemplateState.genericTemplate.id === 0) {
      // if genericTemplate isn't created yet
      dispatch({
        type: 'GENERIC_TEMPLATE_LOADED',
        genericTemplate: initialState.genericTemplate,
      });
    } else {
      await api()
        .getGenericTemplate({
          genericTemplateId: genericTemplateState.genericTemplate.id,
        }) // or load blankQuestionarySteps if genericTemplate is null
        .then((data) => {
          if (data.genericTemplate && data.genericTemplate.questionary.steps) {
            dispatch({
              type: 'GENERIC_TEMPLATE_LOADED',
              genericTemplate: data.genericTemplate,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.genericTemplate.questionary.steps,
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
      next(action);
      const state = getState() as GenericTemplateSubmissionState;
      switch (action.type) {
        case 'GENERIC_TEMPLATE_UPDATED':
          props.genericTemplateUpdated?.({
            ...state.genericTemplate,
            ...action.genericTemplate,
          });
          break;
        case 'GENERIC_TEMPLATE_CREATED':
          props.genericTemplateCreated?.(action.genericTemplate);
          break;
        case 'GENERIC_TEMPLATE_SUBMITTED':
          props.genericTemplateEditDone?.();
          break;
        case 'BACK_CLICKED':
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;
        case 'RESET_CLICKED':
          handleReset();
          break;
      }
    };
  };

  const initialState = new GenericTemplateSubmissionState(
    props.genericTemplate,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(
      props.genericTemplate.questionary.steps
    )
  );

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<GenericTemplateSubmissionState>(
    initialState,
    [handleEvents],
    genericTemplatesReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialGenericTemplate === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'GENERIC_TEMPLATE_LOADED',
        genericTemplate: props.genericTemplate,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.genericTemplate.questionary.steps,
      });
    }
  }, [previousInitialGenericTemplate, props.genericTemplate, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.genericTemplate.title || props.title}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
