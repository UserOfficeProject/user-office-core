import { Link, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { VisitationStatus } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { VisitationContextType } from './VisitationContainer';

type VisitationReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

const useStyles = makeStyles(() => ({
  teamMemberList: {
    listStyle: 'none',
    padding: 0,
  },
}));

function VisitationReview({ confirm }: VisitationReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as VisitationContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const { proposalData } = useProposalData(state.visitation.proposalId);
  const classes = useStyles();

  if (!proposalData) {
    return <UOLoader />;
  }

  const additionalDetails: TableRowData[] = [
    { label: 'Status', value: state.visitation.status },
    {
      label: 'Proposal',
      value: (
        <Link href={`/ProposalEdit/${proposalData.id}`}>
          {proposalData.title}
        </Link>
      ),
    },
    {
      label: 'Team',
      value: (
        <ul className={classes.teamMemberList}>
          {state.visitation.team.map((user) => (
            <li key={user.id}>{`${user.firstname} ${user.lastname}`}</li>
          ))}
        </ul>
      ),
    },
  ];

  const isSubmitted = state.visitation.status === VisitationStatus.SUBMITTED;

  return (
    <div>
      <QuestionaryDetails
        questionaryId={state.visitation.questionaryId}
        additionalDetails={additionalDetails}
        title="Visitation information"
      />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const result = await api().updateVisitation({
                  visitationId: state.visitation.id,
                  status: VisitationStatus.SUBMITTED,
                });
                if (!result.updateVisitation.visitation) {
                  return;
                }
                dispatch({
                  type: 'VISITATION_MODIFIED',
                  visitation: result.updateVisitation.visitation,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after visitation submission.',
              }
            )()
          }
          disabled={isSubmitted}
          variant="contained"
          color="primary"
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </div>
  );
}

export default withConfirm(VisitationReview);
