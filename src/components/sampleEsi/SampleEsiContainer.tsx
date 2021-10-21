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
import { SampleEsiSubmissionState } from 'models/questionary/sampleEsi/SampleEsiSubmissionState';
import { SampleEsiWithQuestionary } from 'models/questionary/sampleEsi/SampleEsiWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface SampleEsiContextType extends QuestionaryContextType {
  state: SampleEsiSubmissionState | null;
}

const sampleEsiReducer = (
  state: SampleEsiSubmissionState,
  draftState: SampleEsiSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'SAMPLE_ESI_CREATED':
    case 'SAMPLE_ESI_LOADED':
      const esi = action.esi;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = esi;
      break;
    case 'SAMPLE_ESI_MODIFIED':
      draftState.esi = {
        ...draftState.esi,
        ...action.esi,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export interface SampleEsiContainerProps {
  esi: SampleEsiWithQuestionary;
  onUpdate?: (esi: SampleEsiWithQuestionary) => void;
  onSubmitted?: (esi: SampleEsiWithQuestionary) => void;
}
export default function SampleEsiContainer(props: SampleEsiContainerProps) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.SAMPLE_ESI);

  const previousInitialEsi = usePrevious(props.esi);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const esiState = state as SampleEsiSubmissionState;

    if (esiState.esi.esiId === 0) {
      // if esi is not created yet
      dispatch({
        type: 'SAMPLE_ESI_LOADED',
        esi: initialState.esi,
      });
    } else {
      await api()
        .getSampleEsi({
          esiId: esiState.esi.esiId,
          sampleId: esiState.esi.sampleId,
        }) // or load blankQuestionarySteps if null
        .then((data) => {
          if (data.sampleEsi && data.sampleEsi.questionary!.steps) {
            dispatch({
              type: 'SAMPLE_ESI_LOADED',
              esi: data.sampleEsi,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.sampleEsi.questionary!.steps,
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
      const state = getState() as SampleEsiSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'SAMPLE_ESI_MODIFIED':
          props.onUpdate?.(state.esi);
          break;

        case 'SAMPLE_ESI_SUBMITTED':
          props.onSubmitted?.(state.esi);
          break;
      }
    };
  };
  const initialState = new SampleEsiSubmissionState(
    props.esi,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.esi.questionary.steps)
  );

  const { state, dispatch } =
    QuestionarySubmissionModel<SampleEsiSubmissionState>(
      initialState,
      [handleEvents],
      sampleEsiReducer
    );

  useEffect(() => {
    const isComponentMountedForTheFirstTime = previousInitialEsi === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'SAMPLE_ESI_LOADED',
        esi: props.esi,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.esi.questionary!.steps,
      });
    }
  }, [previousInitialEsi, props.esi, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.esi.sample.title}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
