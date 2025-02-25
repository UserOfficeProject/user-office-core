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

import { ProposalEsiContextType } from '../experimentSafety/ExperimentSafetyContainer';
import ProposalEsiDetails from './ProposalEsiDetails';

type ProposalEsiReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function ProposalEsiReview({ confirm }: ProposalEsiReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalEsiContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.esi.isSubmitted;

  return (
    <>
      <ProposalEsiDetails esiId={state.esi.id} />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const { updateEsi } = await api().updateEsi({
                  esiId: state.esi.id,
                  isSubmitted: true,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: updateEsi,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                  itemWithQuestionary: updateEsi,
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

export default withConfirm(ProposalEsiReview);
