/* eslint-disable @typescript-eslint/no-use-before-define */
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { default as React, useEffect, useState } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import { QuestionaryStepButton } from 'components/questionary/QuestionaryStepButton';
import { Answer, Questionary, UserRole } from 'generated/sdk';
import { ProposalSubsetSumbission } from 'models/ProposalModel';
import {
  Event,
  EventType,
  ProposalSubmissionModel,
  ProposalSubmissionModelState,
} from 'models/ProposalSubmissionModel';
import { prepareAnswers } from 'models/QuestionaryFunctions';
import { StyledPaper } from 'styles/StyledComponents';
import { clamp } from 'utils/Math';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { QuestionaryUIStep } from '../../hooks/questionary/QuestionaryUIStep';
import { SubmissionContext } from '../../utils/SubmissionContext';
import ProposalInformationView from './ProposalInformationView';
import ProposalQuestionaryStepView from './ProposalQuestionaryStepView';
import ProposalReview from './ProposalSummary';

export interface Notification {
  variant: 'error' | 'success';
  message: string;
}

export default function ProposalContainer(props: {
  data: ProposalSubsetSumbission;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [proposalSteps, setProposalSteps] = useState<QuestionaryUIStep[]>([]);
  const isNonOfficer = !useCheckAccess([UserRole.USER_OFFICER]);

  const { api, isExecutingCall } = useDataApiWithFeedback();

  const clampStep = (step: number): number => {
    return clamp(step, 0, proposalSteps.length - 1);
  };

  const getConfirmNavigMsg = (): string => {
    return 'Changes you recently made in this step will not be saved! Are you sure?';
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (state.isDirty) {
      const confirmed = window.confirm(getConfirmNavigMsg());
      if (confirmed) {
        api()
          .getProposal({ id: state.proposal.id })
          .then(data =>
            dispatch({ type: EventType.MODEL_LOADED, payload: data.proposal })
          );

        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const classes = makeStyles(theme => ({
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
  }))();

  const reduceMiddleware = ({
    getState,
    dispatch,
  }: {
    getState: () => ProposalSubmissionModelState;
    dispatch: React.Dispatch<Event>;
  }) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState();
      switch (action.type) {
        case EventType.BACK_CLICKED:
          if (state.isDirty) {
            if (await handleReset()) {
              setStepIndex(clampStep(stepIndex - 1));
            }
          } else {
            setStepIndex(clampStep(stepIndex - 1));
          }
          break;

        case EventType.SAVE_GENERAL_INFO_CLICKED:
          const { callId } = state.proposal;
          let proposal = state.proposal;
          if (state.proposal.status.id === 0) {
            const response = await api('Saved').createProposal({ callId });
            proposal = { ...proposal, ...response.createProposal.proposal };
            dispatch({
              type: EventType.PROPOSAL_METADATA_CHANGED,
              payload: {
                ...proposal,
              },
            });
          }
          if (proposal) {
            await api('Saved').updateProposal({
              id: proposal.id,
              title: proposal.title,
              abstract: proposal.abstract,
              proposerId: proposal.proposer.id,
              users: proposal.users.map(user => user.id),
            });
            setStepIndex(clampStep(stepIndex + 1));
          }

          break;

        case EventType.SAVE_STEP_CLICKED: {
          const answers: Answer[] = action.payload.answers;
          const topicId: number = action.payload.topicId;
          const {
            answerTopic: { questionaryStep },
          } = await api('Saved').answerTopic({
            questionaryId: state.proposal.questionaryId,
            answers: prepareAnswers(answers),
            topicId: topicId,
            isPartialSave: true,
          });

          if (questionaryStep) {
            dispatch({
              type: EventType.STEP_ANSWERED,
              payload: { step: questionaryStep },
            });
          }
          break;
        }

        case EventType.FINISH_STEP_CLICKED: {
          const answers: Answer[] = action.payload.answers;
          const topicId: number = action.payload.topicId;
          const {
            answerTopic: { questionaryStep },
          } = await api('Step finished').answerTopic({
            questionaryId: state.proposal.questionaryId,
            answers: prepareAnswers(answers),
            topicId: topicId,
            isPartialSave: false,
          });
          if (questionaryStep) {
            dispatch({
              type: EventType.STEP_ANSWERED,
              payload: { step: questionaryStep },
            });
            setStepIndex(clampStep(stepIndex + 1));
          }
          break;
        }

        case EventType.RESET_CLICKED:
          const stepBeforeReset = stepIndex;
          if (await handleReset()) {
            setStepIndex(stepBeforeReset);
          }
          break;
      }
    };
  };

  const { state, dispatch } = ProposalSubmissionModel(props.data, [
    reduceMiddleware,
  ]);

  const isSubmitted = state.proposal.submitted;

  useEffect(() => {
    const createProposalSteps = (
      questionary: Questionary
    ): QuestionaryUIStep[] => {
      let allProposalSteps = new Array<QuestionaryUIStep>();

      allProposalSteps.push(
        new QuestionaryUIStep(
          'New Proposal',
          state.proposal.status.id !== 0,
          (
            <ProposalInformationView
              data={state.proposal}
              readonly={isSubmitted && isNonOfficer}
            />
          )
        )
      );
      allProposalSteps = allProposalSteps.concat(
        questionary.steps.map((step, index, steps) => {
          const editable =
            (index === 0 && state.proposal.status.id !== 0) ||
            step.isCompleted ||
            (steps[index - 1] !== undefined &&
              steps[index - 1].isCompleted === true);

          return new QuestionaryUIStep(
            step.topic.title,
            step.isCompleted,
            (
              <ProposalQuestionaryStepView
                topicId={step.topic.id}
                state={{
                  questionary: state.proposal.questionary,
                  isDirty: state.isDirty,
                }}
                readonly={(!editable || isSubmitted) && isNonOfficer}
                key={step.topic.id}
              />
            )
          );
        })
      );
      allProposalSteps.push(
        new QuestionaryUIStep(
          'Review',
          state.proposal.submitted,
          (
            <ProposalReview
              data={state}
              readonly={isSubmitted && isNonOfficer}
            />
          )
        )
      );

      return allProposalSteps;
    };

    const proposalSteps = createProposalSteps(state.proposal.questionary);
    setProposalSteps(proposalSteps);
  }, [state, isSubmitted, isNonOfficer]);

  // The purpose of this effect is to navigate user to the
  // right step once proposal loads
  useEffect(() => {
    const proposal = props.data;
    if (proposal.status.name === 'DRAFT') {
      const questionarySteps = proposal.questionary.steps;
      const lastFinishedStep = questionarySteps
        .slice()
        .reverse()
        .find(step => step.isCompleted === true);
      setStepIndex(
        clamp(
          lastFinishedStep ? questionarySteps.indexOf(lastFinishedStep) + 2 : 1,
          1,
          questionarySteps.length + 1
        )
      );
    } else {
      if (proposal.status.id === 0) {
        setStepIndex(0);
      } else {
        setStepIndex(proposal.questionary.steps.length + 1);
      }
    }
  }, [props.data]);

  const getStepContent = (step: number) => {
    if (!proposalSteps || proposalSteps.length === 0) {
      return 'Loading...';
    }

    if (!proposalSteps[step]) {
      console.error(`Invalid step ${step}`);

      return <span>Error</span>;
    }

    return proposalSteps[step].element;
  };

  const progressBar = isExecutingCall ? <LinearProgress /> : null;

  return (
    <Container maxWidth="lg">
      <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />
      <SubmissionContext.Provider value={{ dispatch }}>
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
          <Stepper nonLinear activeStep={stepIndex} className={classes.stepper}>
            {proposalSteps.map((step, index, steps) => (
              <Step key={step.title}>
                <QuestionaryStepButton
                  onClick={async () => {
                    if (!state.isDirty || (await handleReset())) {
                      setStepIndex(index);
                    }
                  }}
                  completed={step.completed}
                  editable={
                    index === 0 ||
                    step.completed ||
                    steps[index - 1].completed === true
                  }
                >
                  <span>{step.title}</span>
                </QuestionaryStepButton>
              </Step>
            ))}
          </Stepper>
          {progressBar}
          {getStepContent(stepIndex)}
        </StyledPaper>
      </SubmissionContext.Provider>
    </Container>
  );
}

type TServiceCall<T> = () => Promise<T & { error?: string | null }>;
