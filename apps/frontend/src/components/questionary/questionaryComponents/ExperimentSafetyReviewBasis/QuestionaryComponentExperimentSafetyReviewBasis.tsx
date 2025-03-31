import React, { useContext } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { SampleSubmissionState } from 'models/questionary/sample/SampleSubmissionState';

import { SampleContextType } from '../SampleDeclaration/SampleDeclarationContainer';

function QuestionaryComponentExperimentSafetyReviewBasis(
  props: BasicComponentProps
) {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as SampleContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return <>THE SUBMITTED SAMPLE INFORMATION SHOULD BE DISPLAYED HERE</>;
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
