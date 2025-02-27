/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { QuestionaryStep, TemplateGroupId } from 'generated/sdk';
import { ExperimentSafetySubmissionState } from 'models/questionary/experimentSafety/ExperimentSafetySubmissionState';
import { ExperimentSafetyWithQuestionary } from 'models/questionary/experimentSafety/ExperimentSafetyWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface ExperimentSafetyContextType extends QuestionaryContextType {
  state: ExperimentSafetySubmissionState | null;
}

export function createESIStub(
  templateId: number,
  questionarySteps: QuestionaryStep[]
): ExperimentSafetyWithQuestionary {
  return {
    experimentSafetyPk: 0,
    experimentPk: 0,
    esiQuestionaryId: 0,
    esiQuestionarySubmittedAt: 0,
    createdBy: 0,
    status: '',
    safetyReviewQuestionaryId: 0,
    reviewedBy: 0,
    createdAt: 0,
    updatedAt: 0,
    samples: [],
    questionary: {
      questionaryId: 0,
      isCompleted: false,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    proposal: {
      primaryKey: 0,
      title: '',
      questionary: {
        questionaryId: 0,
        templateId: templateId,
        created: new Date(),
        steps: questionarySteps,
      },
      proposalId: '',
      samples: [],
    },
  };
}

const proposalEsiReducer = (
  state: ExperimentSafetySubmissionState,
  draftState: ExperimentSafetySubmissionState,
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

export interface ExperimentSafetyContainerProps {
  experimentSafety: ExperimentSafetyWithQuestionary;
  previewMode?: boolean;
}
export default function ExperimentSafetyContainer(
  props: ExperimentSafetyContainerProps
) {
  const [initialState] = useState(
    new ExperimentSafetySubmissionState(props.experimentSafety)
  );
  const eventHandlers = useEventHandlers(TemplateGroupId.PROPOSAL_ESI);

  const { state, dispatch } = QuestionarySubmissionModel(
    initialState,
    [eventHandlers],
    proposalEsiReducer
  );

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Input for Experiment Safety Form'}
        previewMode={props.previewMode}
      />
    </QuestionaryContext.Provider>
  );
}
