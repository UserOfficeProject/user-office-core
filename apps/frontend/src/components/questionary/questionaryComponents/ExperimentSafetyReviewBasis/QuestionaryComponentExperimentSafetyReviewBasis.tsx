import React, { useContext } from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { ExperimentSafetyReviewContextType } from 'components/experimentSafetyReview/ExperimentSafetyReviewContainer';
import SampleDetails from 'components/experimentSafetyReview/SampleDetails';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { SampleSubmissionState } from 'models/questionary/sample/SampleSubmissionState';

function QuestionaryComponentExperimentSafetyReviewBasis() {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as ExperimentSafetyReviewContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <SimpleTabs
        tabNames={state.experimentSafety.samples.map(
          (sample) => sample.sample.title || `Sample ${sample.sampleId}`
        )}
        tabPanelPadding={2}
      >
        {state.experimentSafety.samples.map((sample) => (
          <div key={sample.sampleId}>
            <SampleDetails sampleId={sample.sampleId} />
            <QuestionaryDetails questionaryId={sample.sampleEsiQuestionaryId} />
          </div>
        ))}
      </SimpleTabs>
      <QuestionaryDetails
        questionaryId={state.experimentSafety.esiQuestionaryId}
      />
    </>
  );
}

const experimentSafetyReviewBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const sample = (state as SampleSubmissionState).sample;
    const title = sample.title;

    let returnValue = state.questionary.questionaryId;

    if (sample.id > 0) {
      const result = await api.updateSample({
        title: title,
        sampleId: sample.id,
      });
      if (result.updateSample) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
          itemWithQuestionary: result.updateSample,
        });
      }
    } else {
      const result = await api.createSample({
        title: title,
        templateId: state.questionary.templateId,
        proposalPk: sample.proposalPk,
        questionId: sample.questionId,
      });

      if (result.createSample) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_CREATED',
          itemWithQuestionary: result.createSample,
        });
        returnValue = result.createSample.questionaryId;
      }
    }

    return returnValue;
  };

export {
  QuestionaryComponentExperimentSafetyReviewBasis,
  experimentSafetyReviewBasisPreSubmit,
};
