import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ExperimentSafetyContextType } from './ExperimentSafetyContainer';
import ProposalEsiDetails from './ExperimentSafetyDetails';

type ExperimentSafetyReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function ExperimentSafetyReview({ confirm }: ExperimentSafetyReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ExperimentSafetyContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.experimentSafety.esiQuestionarySubmittedAt !== null;

  return (
    <>
      <ProposalEsiDetails esiId={state.experimentSafety.experimentSafetyPk} />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const { submitExperimentSafety } =
                  await api().submitExperimentSafety({
                    experimentSafetyPk:
                      state.experimentSafety.experimentSafetyPk,
                    isSubmitted: true,
                  });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: submitExperimentSafety,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                  itemWithQuestionary: submitExperimentSafety,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after esi submission.',
              }
            )()
          }
          disabled={isSubmitted}
          data-cy="submit-proposal-esi-button"
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ExperimentSafetyReview);
