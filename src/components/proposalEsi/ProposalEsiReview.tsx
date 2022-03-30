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

import { ProposalEsiContextType } from './ProposalEsiContainer';
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
                const result = await api().updateEsi({
                  esiId: state.esi.id,
                  isSubmitted: true,
                });
                if (!result.updateEsi.esi) {
                  return;
                }
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                  itemWithQuestionary: result.updateEsi.esi,
                });
                dispatch({
                  type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                  itemWithQuestionary: result.updateEsi.esi,
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
