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
import { FeedbackSubmissionState } from 'models/questionary/feedback/FeedbackSubmissionState';
import { FeedbackWithQuestionary } from 'models/questionary/feedback/FeedbackWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';
export interface FeedbackContextType extends QuestionaryContextType {
  state: FeedbackSubmissionState | null;
}

const feedbackReducer = (
  state: FeedbackSubmissionState,
  draftState: FeedbackSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'FEEDBACK_CREATED':
    case 'FEEDBACK_LOADED':
      const feedback = action.feedback;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = feedback;
      break;
    case 'FEEDBACK_MODIFIED':
      draftState.feedback = {
        ...draftState.feedback,
        ...action.feedback,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export interface FeedbackContainerProps {
  feedback: FeedbackWithQuestionary;
  onCreate?: (feedback: FeedbackWithQuestionary) => void;
  onUpdate?: (feedback: FeedbackWithQuestionary) => void;
  onSubmitted?: (feedback: FeedbackWithQuestionary) => void;
}
export default function FeedbackContainer(props: FeedbackContainerProps) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateGroupId.FEEDBACK);

  const previousInitialFeedback = usePrevious(props.feedback);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const feedbackState = state as FeedbackSubmissionState;

    if (feedbackState.feedback.questionaryId === 0) {
      // if feedback is not created yet
      dispatch({
        type: 'FEEDBACK_LOADED',
        feedback: initialState.feedback,
      });
    } else {
      await api()
        .getFeedback({
          feedbackId: feedbackState.feedback.id,
        }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.feedback && data.feedback.questionary!.steps) {
            dispatch({
              type: 'FEEDBACK_LOADED',
              feedback: data.feedback,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.feedback.questionary!.steps,
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
      const state = getState() as FeedbackSubmissionState;
      switch (action.type) {
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
          handleReset();
          break;

        case 'FEEDBACK_CREATED':
          props.onCreate?.(state.feedback);
          break;

        case 'FEEDBACK_MODIFIED':
          props.onUpdate?.(state.feedback);
          break;

        case 'FEEDBACK_SUBMITTED':
          props.onSubmitted?.(state.feedback);
          break;
      }
    };
  };
  const initialState = new FeedbackSubmissionState(
    props.feedback,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.feedback.questionary.steps)
  );

  const { state, dispatch } =
    QuestionarySubmissionModel<FeedbackSubmissionState>(
      initialState,
      [handleEvents],
      feedbackReducer
    );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialFeedback === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'FEEDBACK_LOADED',
        feedback: props.feedback,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.feedback.questionary!.steps,
      });
    }
  }, [previousInitialFeedback, props.feedback, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Feedback to the facility'}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
