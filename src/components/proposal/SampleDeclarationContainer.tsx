/* eslint-disable @typescript-eslint/no-use-before-define */
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { default as React, useEffect } from 'react';
import { Prompt } from 'react-router';

import { Sample } from 'generated/sdk';
import { usePersistQuestionaryModel } from 'hooks/questionary/usePersistQuestionaryModel';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionModel';
import { SampleSubmissionState } from 'models/SampleSubmissionModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import { QuestionaryStepButton } from './QuestionaryStepButton';
import QuestionaryStepView from './QuestionaryStepView';

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

export const SampleContext = React.createContext<SampleSubmissionState | null>(
  null
);

const getConfirmNavigMsg = (): string => {
  return 'Changes you recently made in this step will not be saved! Are you sure?';
};

const samplesReducer = (
  state: SampleSubmissionState,
  draftState: SampleSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.SAMPLE_CREATED:
    case EventType.SAMPLE_LOADED:
      const sample: Sample = action.payload.sample;
      draftState.isDirty = false;
      draftState.questionaryId = sample.questionaryId;
      draftState.sample = sample;
      draftState.steps = sample.questionary.steps;
      draftState.templateId = sample.questionary.templateId;
      break;
    case EventType.SAMPLE_MODIFIED:
      draftState.sample = {
        ...draftState.sample,
        ...action.payload.sample,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export function SampleDeclarationContainer(props: {
  sample: Sample;
  sampleCreated: (sample: Sample) => any;
  sampleUpdated: (sample: Sample) => any;
  sampleEditDone: () => any;
}) {
  const classes = useStyles();
  const { api, isExecutingCall: isApiInteracting } = useDataApiWithFeedback();
  const { persistModel, isSavingModel } = usePersistQuestionaryModel();

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (state.isDirty) {
      const confirmed = window.confirm(getConfirmNavigMsg());
      const sampleState = state as SampleSubmissionState;
      if (confirmed) {
        api()
          .getSample({ sampleId: sampleState.sample.id }) // or load blankQuestionarySteps if sample is null
          .then(data => {
            if (data.sample?.questionary.steps) {
              dispatch({
                type: EventType.QUESTIONARY_STEPS_LOADED,
                payload: { questionarySteps: data.sample.questionary.steps },
              });
            }
          });

        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState() as SampleSubmissionState;
      switch (action.type) {
        case EventType.SAMPLE_UPDATED:
          props.sampleUpdated(action.payload.sample);
          break;
        case EventType.SAMPLE_CREATED:
          props.sampleCreated(action.payload.sample);
          break;
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;

        case EventType.QUESTIONARY_STEPS_COMPLETE:
          props.sampleEditDone();
          break;
      }
    };
  };

  const initialState: SampleSubmissionState = {
    sample: props.sample,
    templateId: props.sample.questionary.templateId,
    isDirty: false,
    questionaryId: props.sample.questionary.questionaryId,
    stepIndex: 0,
    steps: props.sample.questionary.steps,
  };

  const { state, dispatch } = QuestionarySubmissionModel<SampleSubmissionState>(
    initialState,
    [handleEvents, persistModel],
    samplesReducer
  );

  useEffect(() => {
    dispatch({
      type: EventType.SAMPLE_LOADED,
      payload: { sample: props.sample },
    });
    dispatch({
      type: EventType.QUESTIONARY_STEPS_LOADED,
      payload: { questionarySteps: props.sample.questionary.steps },
    });
  }, []); // FIXME

  const getStepContent = () => {
    const currentStep = state.steps[state.stepIndex];
    const previousStep =
      state.stepIndex !== 0 ? state.steps[state.stepIndex - 1] : undefined;

    if (!currentStep) {
      return null;
    }

    return (
      <SampleContext.Provider value={state}>
        <QuestionaryStepView
          topicId={currentStep.topic.id}
          state={state}
          readonly={
            isSavingModel ||
            isApiInteracting ||
            (previousStep ? previousStep.isCompleted === false : false)
          }
          dispatch={dispatch}
          key={currentStep.topic.id}
        />
      </SampleContext.Provider>
    );
  };

  const progressBar =
    isApiInteracting || isSavingModel ? <LinearProgress /> : null;

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
      </Stepper>
      {progressBar}
      {getStepContent()}
    </Container>
  );
}
