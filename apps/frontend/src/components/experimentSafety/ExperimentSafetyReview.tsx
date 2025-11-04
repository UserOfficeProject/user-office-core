import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import {
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ExperimentSafetyContextType } from './ExperimentSafetyContainer';
import ExperimentSafetyDetails from './ExperimentSafetyDetails';

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

  // Check if any decision has been made (not null, not undefined, not UNSET)
  const hasInstrumentScientistDecision =
    state.experimentSafety.instrumentScientistDecision !== null &&
    state.experimentSafety.instrumentScientistDecision !== undefined &&
    state.experimentSafety.instrumentScientistDecision !==
      InstrumentScientistDecisionEnum.UNSET;

  const hasExperimentSafetyReviewerDecision =
    state.experimentSafety.experimentSafetyReviewerDecision !== null &&
    state.experimentSafety.experimentSafetyReviewerDecision !== undefined &&
    state.experimentSafety.experimentSafetyReviewerDecision !==
      ExperimentSafetyReviewerDecisionEnum.UNSET;

  const hasDecision =
    hasInstrumentScientistDecision || hasExperimentSafetyReviewerDecision;

  const isDisabled = isSubmitted || hasDecision;

  // Create appropriate button label
  let buttonLabel = 'Submit';
  if (isSubmitted) {
    buttonLabel = '✔ Submitted';
  } else if (hasDecision) {
    buttonLabel = '✔ Decision Made';
  }

  return (
    <>
      <ExperimentSafetyDetails
        experimentSafetyPk={state.experimentSafety.experimentSafetyPk}
      />
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
          disabled={isDisabled}
          data-cy="submit-proposal-esi-button"
        >
          {buttonLabel}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ExperimentSafetyReview);
