/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { Proposal, QuestionaryStep } from 'generated/sdk';
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
  WizardStep,
} from 'models/QuestionarySubmissionState';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import ProposalSummary from './ProposalSummary';

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
      draftState.questionaryId = proposal.questionaryId;
      draftState.proposal = proposal;
      draftState.steps = proposal.questionary?.steps || [];
      draftState.templateId = proposal.questionary?.templateId || 0;
      break;
    case 'PROPOSAL_MODIFIED':
      draftState.proposal = {
        ...draftState.proposal,
        ...action.proposal,
      };
      draftState.isDirty = true;
      break;
    case 'STEPS_LOADED': {
      if (draftState.proposal.questionary) {
        draftState.proposal.questionary.steps = action.steps;
      }
      break;
    }
    case 'STEP_ANSWERED':
      const updatedStep = action.step;
      if (draftState.proposal.questionary) {
        const stepIndex = draftState.proposal.questionary.steps.findIndex(
          (step) => step.topic.id === updatedStep.topic.id
        );
        draftState.proposal.questionary.steps[stepIndex] = updatedStep;
      }

      break;
  }

  return draftState;
};

const isProposalSubmitted = (proposal: Pick<Proposal, 'submitted'>) =>
  proposal.submitted;

function getProposalStatus(proposal: ProposalSubsetSubmission) {
  if (proposal.status != null) {
    return proposal.status?.shortCode.toString();
  } else {
    return 'Proposal Status is null';
  }
}

function isReadOnly(proposalToCheck: ProposalSubsetSubmission) {
  if (
    !proposalToCheck.submitted ||
    getProposalStatus(proposalToCheck) === 'EDITABLE_SUBMITTED' ||
    getProposalStatus(proposalToCheck) === 'DRAFT'
  ) {
    return false;
  } else {
    return true;
  }
}

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const proposalState = state as ProposalSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly: isReadOnly(proposalState.proposal),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'ProposalReview',
  getMetadata: (state) => {
    const proposalState = state as ProposalSubmissionState;
    const lastProposalStep = proposalState.steps[state.steps.length - 1];

    return {
      title: 'Review',
      isCompleted: isProposalSubmitted(proposalState.proposal),
      isReadonly:
        isReadOnly(proposalState.proposal) &&
        lastProposalStep.isCompleted === true,
    };
  },
});

export default function ProposalContainer(props: {
  proposal: ProposalSubsetSubmission;
  proposalCreated?: (proposal: ProposalSubsetSubmission) => void;
  proposalUpdated?: (proposal: ProposalSubsetSubmission) => void;
}) {
  const { api } = useDataApiWithFeedback();
  const { persistModel: persistProposalModel } = usePersistProposalModel();
  const previousInitialProposal = usePrevious(props.proposal);

  const createProposalWizardSteps = (): WizardStep[] => {
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.proposal.questionary?.steps;

    questionarySteps?.forEach((step, index) =>
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
      case 'ProposalReview':
        return <ProposalSummary data={state} readonly={isReadonly} />;

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const proposalState = state as ProposalSubmissionState;
    if (proposalState.proposal.id === 0) {
      // if proposal is not created yet
      dispatch({
        type: 'PROPOSAL_LOADED',
        proposal: initialState.proposal,
      });
    } else {
      await api()
        .getProposal({ id: proposalState.proposal.id }) // or load blankQuestionarySteps if sample is null
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
  const initialState: ProposalSubmissionState = {
    proposal: props.proposal,
    templateId: props.proposal.questionary?.templateId || 0,
    isDirty: false,
    questionaryId: props.proposal.questionary?.questionaryId || null,
    stepIndex: 0,
    steps: props.proposal.questionary?.steps || [],
    wizardSteps: createProposalWizardSteps(),
  };

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
              state.proposal.shortCode
                ? `Proposal ID: ${state.proposal.shortCode}`
                : 'DRAFT'
            }
            handleReset={handleReset}
            displayElementFactory={displayElementFactory}
          />
        </StyledPaper>
      </ContentContainer>
    </QuestionaryContext.Provider>
  );
}
