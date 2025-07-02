/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useContext, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { UserContext } from 'context/UserContextProvider';
import { TemplateGroupId } from 'generated/sdk';
import { ExperimentSafetyReviewSubmissionState } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewSubmissionState';
import { ExperimentSafetyReviewWithQuestionary } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface ExperimentSafetyReviewContextType
  extends QuestionaryContextType {
  state: ExperimentSafetyReviewSubmissionState | null;
}

const experimentSafetyReviewReducer = (
  state: ExperimentSafetyReviewSubmissionState,
  draftState: ExperimentSafetyReviewSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'SAMPLE_CREATED':
      if (!draftState.experimentSafety.proposal.samples) {
        draftState.experimentSafety.proposal.samples = [];
      }
      draftState.experimentSafety.proposal.samples.push(action.sample);
      break;

    case 'SAMPLE_DELETED':
      draftState.experimentSafety.proposal.samples =
        draftState.experimentSafety.proposal.samples!.filter(
          (sample) => sample.id !== action.sampleId
        );
      break;

    case 'SAMPLE_ADDED_TO_EXPERIMENT':
      draftState.experimentSafety.samples.push(action.experimentSample);
      break;

    case 'EXPERIMENT_SAMPLE_UPDATED':
      draftState.experimentSafety.samples =
        draftState.experimentSafety.samples.map((sample) =>
          sample.sampleId === action.experimentSample.sampleId
            ? action.experimentSample
            : sample
        );
      break;

    case 'SAMPLE_REMOVED_FROM_EXPERIMENT':
      draftState.experimentSafety.samples =
        draftState.experimentSafety.samples.filter(
          (sample) => sample.sampleId !== action.sampleId
        );
      break;
  }

  return draftState;
};

export interface ExperimentSafetyReviewContainerProps {
  experimentSafety: ExperimentSafetyReviewWithQuestionary;
  previewMode?: boolean;
}
export default function ExperimentSafetyReviewContainer(
  props: ExperimentSafetyReviewContainerProps
) {
  const { currentRole } = useContext(UserContext);

  const [initialState] = useState(
    new ExperimentSafetyReviewSubmissionState(
      props.experimentSafety,
      currentRole,
      props.previewMode
    )
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.EXP_SAFETY_REVIEW);

  const { state, dispatch } = QuestionarySubmissionModel(
    initialState,
    [eventHandlers],
    experimentSafetyReviewReducer
  );

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Experiment Safety Review'}
        previewMode={props.previewMode}
      />
    </QuestionaryContext.Provider>
  );
}
