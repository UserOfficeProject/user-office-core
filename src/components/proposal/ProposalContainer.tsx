/* eslint-disable @typescript-eslint/no-use-before-define */
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { default as React, useEffect } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import { QuestionaryStepButton } from 'components/questionary/QuestionaryStepButton';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import {
  Proposal,
  Questionary,
  QuestionaryStep,
  UserRole,
} from 'generated/sdk';
import { usePersistProposalModel } from 'hooks/questionary/usePersistProposalModel';
import { usePersistQuestionaryModel } from 'hooks/questionary/usePersistQuestionaryModel';
import { ProposalSubsetSumbission } from 'models/ProposalModel';
import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import ProposalSummary from './ProposalSummary';

const useStyles = makeStyles(theme => ({
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  heading: {
    textOverflow: 'ellipsis',
    width: '80%',
    margin: '0 auto',
    textAlign: 'center',
    minWidth: '450px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  infoline: {
    color: theme.palette.grey[600],
    textAlign: 'right',
  },
}));

type ProposalContextType = {
  state: ProposalSubmissionState | null;
  dispatch: React.Dispatch<Event>;
};

export const ProposalContext = React.createContext<ProposalContextType>({
  state: null,
  dispatch: (e: Event) => {},
});

const getReviewStepIndex = (state: ProposalSubmissionState) =>
  state.steps.length;

const getConfirmNavigMsg = (): string => {
  return 'Changes you recently made in this step will not be saved! Are you sure?';
};

const proposalReducer = (
  state: ProposalSubmissionState,
  draftState: ProposalSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.PROPOSAL_CREATED:
    case EventType.PROPOSAL_LOADED:
      const proposal: Proposal = action.payload.proposal;
      draftState.isDirty = false;
      draftState.questionaryId = proposal.questionaryId;
      draftState.proposal = proposal;
      draftState.steps = proposal.questionary.steps;
      draftState.templateId = proposal.questionary.templateId;
      break;
    case EventType.PROPOSAL_MODIFIED:
      draftState.proposal = {
        ...draftState.proposal,
        ...action.payload.proposal,
      };
      draftState.isDirty = true;
      break;
    case EventType.GO_TO_STEP:
      const reviewStepIdx = getReviewStepIndex(state);
      if (action.payload.stepIndex === reviewStepIdx) {
        draftState.stepIndex = reviewStepIdx;
      }
      break;

    case EventType.QUESTIONARY_STEPS_COMPLETE: {
      draftState.stepIndex = getReviewStepIndex(state);
      break;
    }
    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.proposal.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED:
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.proposal.questionary.steps.findIndex(
        step => step.topic.id === updatedStep.topic.id
      );
      draftState.proposal.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

export default function ProposalContainer(props: {
  proposal: ProposalSubsetSumbission;
  proposalCreated?: (proposal: Proposal) => any;
  proposalUpdated?: (proposal: Proposal) => any;
}) {
  const isNonOfficer = !useCheckAccess([UserRole.USER_OFFICER]);

  const classes = useStyles();
  const { api, isExecutingCall: isApiInteracting } = useDataApiWithFeedback();
  const { persistModel, isSavingModel } = usePersistQuestionaryModel();
  const {
    persistModel: persistProposalModel,
    isSavingModel: isSavingProposalModel,
  } = usePersistProposalModel();

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (state.isDirty) {
      const confirmed = window.confirm(getConfirmNavigMsg());
      const proposalState = state as ProposalSubmissionState;
      if (confirmed) {
        if (proposalState.proposal.id === 0) {
          // if proposal is not created yet
          dispatch({
            type: EventType.PROPOSAL_LOADED,
            payload: { proposal: initialState.proposal },
          });
        } else {
          await api()
            .getProposal({ id: proposalState.proposal.id }) // or load blankQuestionarySteps if sample is null
            .then(data => {
              if (data.proposal && data.proposal.questionary.steps) {
                dispatch({
                  type: EventType.PROPOSAL_LOADED,
                  payload: { proposal: data.proposal },
                });
                dispatch({
                  type: EventType.QUESTIONARY_STEPS_LOADED,
                  payload: {
                    questionarySteps: data.proposal.questionary.steps,
                    stepIndex: state.stepIndex,
                  },
                });
              }
            });
        }

        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const allStepsComplete = (questionary: Questionary) =>
    questionary && questionary.steps.every(step => step.isCompleted);

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState() as ProposalSubmissionState;
      switch (action.type) {
        case EventType.PROPOSAL_MODIFIED:
          props.proposalUpdated?.(action.payload.proposal);
          break;
        case EventType.PROPOSAL_CREATED:
          props.proposalCreated?.(action.payload.proposal);
          break;
        case EventType.BACK_CLICKED: // TODO check if this event is really necessary
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;
      }
    };
  };

  const initialState: ProposalSubmissionState = {
    proposal: props.proposal,
    templateId: props.proposal.questionary.templateId,
    isDirty: false,
    questionaryId: props.proposal.questionary.questionaryId,
    stepIndex: 0,
    steps: props.proposal.questionary.steps,
  };

  const { state, dispatch } = QuestionarySubmissionModel<
    ProposalSubmissionState
  >(
    initialState,
    [handleEvents, persistModel, persistProposalModel],
    proposalReducer
  );

  const isSubmitted = state.proposal.submitted; // TODO check where to use this?

  useEffect(() => {
    dispatch({
      type: EventType.PROPOSAL_LOADED,
      payload: { proposal: props.proposal },
    });
    dispatch({
      type: EventType.QUESTIONARY_STEPS_LOADED,
      payload: { questionarySteps: props.proposal.questionary.steps },
    });
  }, []); // FIXME

  const getStepperNavig = () => {
    if (state.steps.length <= 1) {
      return null;
    }

    return (
      <Stepper
        nonLinear
        activeStep={state.stepIndex}
        className={classes.stepper}
      >
        {state.steps.map((step, index, steps) => (
          <Step key={index}>
            <QuestionaryStepButton
              onClick={async () => {
                if (!state.isDirty || (await handleReset())) {
                  dispatch({
                    type: EventType.GO_TO_STEP,
                    payload: { stepIndex: index },
                  });
                }
              }}
              completed={step.isCompleted}
              editable={
                index === 0 ||
                step.isCompleted ||
                steps[index].isCompleted === true
              }
            >
              <span>{step.topic.title}</span>
            </QuestionaryStepButton>
          </Step>
        ))}
        <Step key="review">
          <QuestionaryStepButton
            onClick={async () => {
              dispatch({
                type: EventType.GO_TO_STEP,
                payload: { stepIndex: state.steps.length },
              });
            }}
            completed={state.proposal.submitted}
            editable={allStepsComplete(state.proposal.questionary)}
          >
            <span>Review</span>
          </QuestionaryStepButton>
        </Step>
      </Stepper>
    );
  };

  const getStepContent = () => {
    if (state.stepIndex === getReviewStepIndex(state)) {
      return <ProposalSummary data={state} readonly={false} />;
    }
    const currentStep = state.steps[state.stepIndex];
    const previousStep = state.steps[state.stepIndex - 1];

    if (!currentStep) {
      return null;
    }

    return (
      <QuestionaryStepView
        topicId={currentStep.topic.id}
        state={state}
        readonly={
          isApiInteracting ||
          (previousStep ? previousStep.isCompleted === false : false) ||
          (isSubmitted && isNonOfficer)
        }
        dispatch={dispatch}
        key={currentStep.topic.id}
      />
    );
  };

  const getProgressBar = () =>
    isApiInteracting || isSavingModel || isSavingProposalModel ? (
      <LinearProgress />
    ) : null;

  return (
    <ProposalContext.Provider value={{ state, dispatch }}>
      <Container maxWidth="lg">
        <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />
        <StyledPaper>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            className={classes.heading}
          >
            {state.proposal.title || 'New Proposal'}
          </Typography>
          <div className={classes.infoline}>
            {state.proposal.shortCode
              ? `Proposal ID: ${state.proposal.shortCode}`
              : null}
          </div>
          <div className={classes.infoline}>{state.proposal.status.name}</div>
          {getStepperNavig()}
          {getProgressBar()}
          {getStepContent()}
        </StyledPaper>
      </Container>
    </ProposalContext.Provider>
  );
}
