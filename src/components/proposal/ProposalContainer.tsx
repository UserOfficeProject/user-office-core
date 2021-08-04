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
import { usePersistProposalModel } from 'hooks/proposal/usePersistProposalModel';
import {
  ProposalSubmissionState,
  ProposalSubsetSubmission,
} from 'models/ProposalSubmissionState';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface ProposalContextType extends QuestionaryContextType {
  state: ProposalSubmissionState | null;
}

const proposalReducer = (
  state: ProposalSubmissionState,
  draftState: ProposalSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'PROPOSAL_CREATED':
    case 'PROPOSAL_LOADED':
      const proposal = action.proposal;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = proposal;
      break;
    case 'PROPOSAL_MODIFIED':
      draftState.itemWithQuestionary = {
        ...draftState.itemWithQuestionary,
        ...action.proposal,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export default function ProposalContainer(props: {
  proposal: ProposalSubsetSubmission;
  proposalCreated?: (proposal: ProposalSubsetSubmission) => void;
  proposalUpdated?: (proposal: ProposalSubsetSubmission) => void;
}) {
  const { api } = useDataApiWithFeedback();
  const { persistModel: persistProposalModel } = usePersistProposalModel();
  const previousInitialProposal = usePrevious(props.proposal);

  const def = getQuestionaryDefinition(TemplateCategoryId.PROPOSAL_QUESTIONARY);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const proposalState = state as ProposalSubmissionState;
    if (proposalState.proposal.primaryKey === 0) {
      // if proposal is not created yet
      dispatch({
        type: 'PROPOSAL_LOADED',
        proposal: initialState.proposal,
      });
    } else {
      await api()
        .getProposal({ primaryKey: proposalState.proposal.primaryKey }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.proposal && data.proposal.questionary?.steps) {
            dispatch({
              type: 'PROPOSAL_LOADED',
              proposal: data.proposal,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.proposal.questionary.steps,
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
      const state = getState() as ProposalSubmissionState;
      switch (action.type) {
        case 'PROPOSAL_MODIFIED':
          props.proposalUpdated?.({ ...state.proposal, ...action.proposal });
          break;
        case 'PROPOSAL_CREATED':
          props.proposalCreated?.(action.proposal);
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
  const initialState = new ProposalSubmissionState(
    props.proposal,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.proposal.questionary.steps)
  );

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<ProposalSubmissionState>(
    initialState,
    [handleEvents, persistProposalModel],
    proposalReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialProposal === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'PROPOSAL_LOADED',
        proposal: props.proposal,
      });
      if (props.proposal.questionary) {
        dispatch({
          type: 'STEPS_LOADED',
          steps: props.proposal.questionary.steps,
        });
      }
    }
  }, [previousInitialProposal, props.proposal, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <ContentContainer maxWidth="md">
        <StyledPaper>
          <Questionary
            title={state.proposal.title || 'New Proposal'}
            info={
              state.proposal.proposalId
                ? `Proposal ID: ${state.proposal.proposalId}`
                : 'DRAFT'
            }
            handleReset={handleReset}
            displayElementFactory={def.displayElementFactory}
          />
        </StyledPaper>
      </ContentContainer>
    </QuestionaryContext.Provider>
  );
}
