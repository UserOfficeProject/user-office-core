/* eslint-disable @typescript-eslint/no-use-before-define */
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { default as React, useEffect } from 'react';
import { Prompt } from 'react-router';

import { QuestionaryStepButton } from 'components/questionary/QuestionaryStepButton';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { Sample } from 'generated/sdk';
import { usePersistQuestionaryModel } from 'hooks/questionary/usePersistQuestionaryModel';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import { SampleSubmissionState } from 'models/SampleSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

const useStyles = makeStyles(theme => ({
  stepper: {
    padding: theme.spacing(3, 0, 1),
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
  title: {
    marginTop: theme.spacing(1),
  },
}));
type SampleContextType = {
  state: SampleSubmissionState | null;
  dispatch: React.Dispatch<Event>;
};
export const SampleContext = React.createContext<SampleContextType>({
  state: null,
  dispatch: e => {},
});

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
  sampleCreated?: (sample: Sample) => any;
  sampleUpdated?: (sample: Sample) => any;
  sampleEditDone?: () => any;
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
        if (sampleState.sample.id === 0) {
          // if sample isn't created yet
          dispatch({
            type: EventType.SAMPLE_LOADED,
            payload: { sample: initialState.sample },
          });
        } else {
          api()
            .getSample({ sampleId: sampleState.sample.id }) // or load blankQuestionarySteps if sample is null
            .then(data => {
              if (data.sample && data.sample.questionary.steps) {
                dispatch({
                  type: EventType.SAMPLE_LOADED,
                  payload: { sample: data.sample },
                });
                dispatch({
                  type: EventType.QUESTIONARY_STEPS_LOADED,
                  payload: {
                    questionarySteps: data.sample.questionary.steps,
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

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action);
      const state = getState() as SampleSubmissionState;
      switch (action.type) {
        case EventType.SAMPLE_UPDATED:
          props.sampleUpdated?.(action.payload.sample);
          break;
        case EventType.SAMPLE_CREATED:
          props.sampleCreated?.(action.payload.sample);
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
          props.sampleEditDone?.();
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
      </Stepper>
    );
  };

  const getStepContent = () => {
    const currentStep = state.steps[state.stepIndex];
    const previousStep = state.steps[state.stepIndex - 1];

    if (!currentStep) {
      return null;
    }

    return (
      <SampleContext.Provider value={{ state, dispatch }}>
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

  const getProgressBar = () =>
    isApiInteracting || isSavingModel ? <LinearProgress /> : null;

  return (
    <Container maxWidth="lg">
      <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />
      <Typography variant="h5" className={classes.title}>
        {state.sample.title || 'Untited'}
      </Typography>
      {getStepperNavig()}
      {getProgressBar()}
      {getStepContent()}
    </Container>
  );
}
