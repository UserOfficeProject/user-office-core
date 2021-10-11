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
import { ProposalEsiSubmissionState } from 'models/questionary/proposalEsi/ProposalEsiSubmissionState';
import { ProposalEsiWithQuestionary } from 'models/questionary/proposalEsi/ProposalEsiWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface ProposalEsiContextType extends QuestionaryContextType {
  state: ProposalEsiSubmissionState | null;
}

const proposalEsiReducer = (
  state: ProposalEsiSubmissionState,
  draftState: ProposalEsiSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'ESI_CREATED':
    case 'ESI_LOADED':
      const esi = action.esi;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = esi;
      break;
    case 'ESI_MODIFIED':
      draftState.esi = {
        ...draftState.esi,
        ...action.esi,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export interface ProposalEsiContainerProps {
  esi: ProposalEsiWithQuestionary;
  onCreate?: (esi: ProposalEsiWithQuestionary) => void;
  onUpdate?: (esi: ProposalEsiWithQuestionary) => void;
  onSubmitted?: (esi: ProposalEsiWithQuestionary) => void;
}
export default function ProposalEsiContainer(props: ProposalEsiContainerProps) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.PROPOSAL_ESI);

  const previousInitialEsi = usePrevious(props.esi);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const esiState = state as ProposalEsiSubmissionState;

    if (esiState.esi.id === 0) {
      // if esi is not created yet
      dispatch({
        type: 'ESI_LOADED',
        esi: initialState.esi,
      });
    } else {
      await api()
        .getEsi({
          esiId: esiState.esi.id,
        }) // or load blankQuestionarySteps if null
        .then((data) => {
          if (data.esi && data.esi.questionary!.steps) {
            dispatch({
              type: 'ESI_LOADED',
              esi: data.esi,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.esi.questionary!.steps,
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
      const state = getState() as ProposalEsiSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'ESI_CREATED':
          break;

        case 'ESI_MODIFIED':
          props.onUpdate?.(state.esi);
          break;

        case 'ESI_SUBMITTED':
          props.onSubmitted?.(state.esi);
          break;
      }
    };
  };
  const initialState = new ProposalEsiSubmissionState(
    props.esi,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.esi.questionary.steps)
  );

  const { state, dispatch } =
    QuestionarySubmissionModel<ProposalEsiSubmissionState>(
      initialState,
      [handleEvents],
      proposalEsiReducer
    );

  useEffect(() => {
    const isComponentMountedForTheFirstTime = previousInitialEsi === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'ESI_LOADED',
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
        title={'Input for Experiment Safety Form'}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
