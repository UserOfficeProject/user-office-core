import { makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ProposalEsiContextType } from './ProposalEsiContainer';

const useStyles = makeStyles(() => ({
  sampleList: {
    listStyle: 'none',
    padding: 0,
  },
}));

type ProposalEsiReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function ProposalEsiReview({ confirm }: ProposalEsiReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const classes = useStyles();

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalEsiContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.esi.isSubmitted;

  const additionalDetails: TableRowData[] = [
    { label: 'Proposal ID', value: state.esi?.proposal.proposalId || '' },
    { label: 'Proposal Title', value: state.esi?.proposal.title || '' },
    {
      label: 'Samples for the experiment',
      value: (
        <ul className={classes.sampleList}>
          {state.esi.sampleEsis.map((esi) => (
            <li key={esi.esiId}>{esi.sample.title}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.esi.questionary.questionaryId}
        additionalDetails={additionalDetails}
        title="Experiment safety input"
      />
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
                  type: 'ESI_MODIFIED',
                  esi: result.updateEsi.esi,
                });
                dispatch({
                  type: 'ESI_SUBMITTED',
                  esi: result.updateEsi.esi,
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
          variant="contained"
          color="primary"
          data-cy="submit-proposal-esi-button"
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ProposalEsiReview);
