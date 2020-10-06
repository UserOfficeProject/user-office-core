/* eslint-disable @typescript-eslint/no-use-before-define */
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { default as React, useEffect } from 'react';
import { Prompt } from 'react-router';

import { QuestionaryStep, Sample, SampleStatus } from 'generated/sdk';
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

const getTemplateId = (sampleOrIdOfTemplate: Sample | number) => {
  if (Number.isInteger(sampleOrIdOfTemplate)) {
    return sampleOrIdOfTemplate as number;
  } else {
    return (sampleOrIdOfTemplate as Sample).questionary.templateId;
  }
};

const getConfirmNavigMsg = (): string => {
  return 'Changes you recently made in this step will not be saved! Are you sure?';
};

const createSampleStub = (
  templateId: number,
  questionarySteps: QuestionaryStep[]
): Sample => {
  return {
    id: 0,
    created: new Date(),
    creatorId: 0, // FIXME
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryId: 0,
    safetyComment: '',
    safetyStatus: SampleStatus.NONE,
    title: 'Untited',
  };
};

const samplesReducer = (
  state: SampleSubmissionState,
  draftState: SampleSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.SAMPLE_LOADED:
      const sample: Sample = action.payload.sample;
      draftState.isDirty = false;
      draftState.questionaryId = sample.questionaryId;
      draftState.sample = sample;
      draftState.steps = sample.questionary.steps;
      draftState.templateId = sample.questionary.templateId;
      break;
    case EventType.SAMPLE_UPDATED:
      draftState.sample = {
        ...draftState.sample,
        ...action.payload.sample,
      };
      break;
  }

  return draftState;
};

export function SampleDeclarationContainer(props: {
  sampleOrIdOfTemplate: Sample | number;
  sampleEditDone: (sample: Sample | null) => any;
}) {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const templateId = getTemplateId(props.sampleOrIdOfTemplate);

  useEffect(() => {
    const isTemplateIdProvided = Number.isInteger(props.sampleOrIdOfTemplate);
    if (isTemplateIdProvided) {
      api()
        .getBlankQuestionarySteps({ templateId })
        .then(result => {
          const blankSteps = result.blankQuestionarySteps;
          if (blankSteps) {
            const sampleStub = createSampleStub(templateId, blankSteps);
            dispatch({
              type: EventType.SAMPLE_LOADED,
              payload: { sample: sampleStub },
            });
          }
        });
    } else {
      const sample = props.sampleOrIdOfTemplate as Sample;
      dispatch({
        type: EventType.SAMPLE_LOADED,
        payload: { sample: sample },
      });
    }
  }, [api, props]);

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
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;

        case EventType.QUESTIONARY_STEPS_COMPLETE:
          props.sampleEditDone(state.sample);
          break;
      }
    };
  };

  const initialState: SampleSubmissionState = {
    sample: createSampleStub(templateId, []),
    templateId,
    isDirty: false,
    questionaryId: 0,
    stepIndex: 0,
    steps: [],
  };

  const { state, dispatch } = QuestionarySubmissionModel<SampleSubmissionState>(
    initialState,
    [handleEvents],
    samplesReducer
  );

  const getStepContent = () => {
    const curentStep = state.steps[state.stepIndex];
    const previousStep =
      state.stepIndex !== 0 ? state.steps[state.stepIndex - 1] : undefined;

    if (!curentStep) {
      return null;
    }

    return (
      <SampleContext.Provider value={state}>
        <QuestionaryStepView
          topicId={curentStep.topic.id}
          state={state}
          readonly={previousStep ? previousStep.isCompleted === false : false}
          dispatch={dispatch}
          key={curentStep.topic.id}
        />
      </SampleContext.Provider>
    );
  };

  const progressBar = isExecutingCall ? <LinearProgress /> : null;

  return (
    <Container maxWidth="lg">
      <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />
      <Typography>{'Untitled'}</Typography>
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
