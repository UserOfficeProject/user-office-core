import { Typography } from '@material-ui/core';
/* eslint-disable @typescript-eslint/no-use-before-define */
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { default as React } from 'react';
import { Prompt } from 'react-router';

import { Sample } from 'generated/sdk';
import {
  Event,
  EventType,
  SampleSubmissionModel,
  SampleSubmissionModelState,
} from 'models/SampleSubmissionModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import { QuestionaryStepButton } from './QuestionaryStepButton';
import SampleQuestionaryStepView from './SampleQuestionaryStepView';
import SampleTitleEditor from './SampleTitleEditor';

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

export default function SampleDeclarationContainer(props: {
  data: Sample;
  sampleEditDone: (sample: Sample) => any;
}) {
  const { api, isExecutingCall } = useDataApiWithFeedback();

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
          .getSample({ sampleId: state.sample.id })
          .then(data =>
            dispatch({
              type: EventType.SAMPLE_LOADED,
              payload: { sample: data.sample },
            })
          );

        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const classes = useStyles();

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<SampleSubmissionModelState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState();
      switch (action.type) {
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;

        case EventType.QUESTIONARY_COMPLETE:
          props.sampleEditDone(state.sample);
          break;
      }
    };
  };

  const { state, dispatch } = SampleSubmissionModel(props.data, [handleEvents]);

  const getStepContent = (
    stepIdx: number,
    state: SampleSubmissionModelState
  ) => {
    if (stepIdx === 0) {
      return <SampleTitleEditor state={state.sample} dispatch={dispatch} />;
    } else {
      const questionaryStep = state.sample.questionary.steps[stepIdx - 1];

      return (
        <SampleQuestionaryStepView
          topicId={questionaryStep.topic.id}
          state={{
            questionary: state.sample.questionary,
            isDirty: state.isDirty,
          }}
          readonly={state.steps[stepIdx - 1].isComplete === false}
          dispatch={dispatch}
          key={questionaryStep.topic.id}
        />
      );
    }
  };

  const progressBar = isExecutingCall ? <LinearProgress /> : null;

  return (
    <Container maxWidth="lg">
      <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />
      <Typography>{state.sample.title}</Typography>
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
              completed={step.isComplete}
              editable={
                index === 0 ||
                step.isComplete ||
                steps[index - 1].isComplete === true
              }
            >
              <span>{step.title}</span>
            </QuestionaryStepButton>
          </Step>
        ))}
      </Stepper>
      {progressBar}
      {getStepContent(state.stepIndex, state)}
    </Container>
  );
}
