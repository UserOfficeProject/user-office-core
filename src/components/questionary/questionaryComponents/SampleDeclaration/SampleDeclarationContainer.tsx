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
import { SampleSubmissionState } from 'models/questionary/sample/SampleSubmissionState';
import { SampleWithQuestionary } from 'models/questionary/sample/SampleWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface SampleContextType extends QuestionaryContextType {
  state: SampleSubmissionState | null;
}

export function SampleDeclarationContainer(props: {
  sample: SampleWithQuestionary;
  sampleCreated?: (sample: SampleWithQuestionary) => void;
  sampleUpdated?: (sample: SampleWithQuestionary) => void;
  sampleEditDone?: () => void;
}) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.SAMPLE);

  const previousInitialSample = usePrevious(props.sample);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const sampleState = state as SampleSubmissionState;
    if (sampleState.sample.id === 0) {
      // if sample isn't created yet
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: initialState.sample,
      });
    } else {
      await api()
        .getSample({ sampleId: sampleState.sample.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.sample && data.sample.questionary.steps) {
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_LOADED',
              itemWithQuestionary: data.sample,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.sample.questionary.steps,
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
      const state = getState() as SampleSubmissionState;
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          props.sampleUpdated?.({
            ...state.sample,
            ...action.itemWithQuestionary,
          });
          break;
        case 'ITEM_WITH_QUESTIONARY_CREATED':
          props.sampleCreated?.(
            action.itemWithQuestionary as SampleWithQuestionary
          );
          break;
        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
          props.sampleEditDone?.();
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

  const initialState = new SampleSubmissionState(
    props.sample,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.sample.questionary.steps)
  );

  const { state, dispatch } = QuestionarySubmissionModel<SampleSubmissionState>(
    initialState,
    [handleEvents]
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialSample === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: props.sample,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.sample.questionary.steps,
      });
    }
  }, [previousInitialSample, props.sample, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.sample.title || 'New Sample'}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
