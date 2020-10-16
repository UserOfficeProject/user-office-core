import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useContext } from 'react';

import NavigationFragment from 'components/questionary/NavigationFragment';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import { EventType } from 'models/QuestionarySubmissionState';
import withConfirm from 'utils/withConfirm';

import { ProposalContext } from './ProposalContainer';

function ProposalReview({ data, readonly, confirm }: ProposalSummaryProps) {
  const context = useContext(ProposalContext);

  if (!context) {
    throw new Error(
      'ProposalReview is missing SubmissionContext. Wrap ProposalReview or one of its parrents with SubmissionContext'
    );
  }
  const { dispatch } = context;
  const downloadPDFProposal = useDownloadPDFProposal();
  const proposal = data.proposal;

  const allStepsComplete =
    proposal.questionary &&
    proposal.questionary.steps.every(step => step.isCompleted);

  const classes = makeStyles(theme => ({
    buttons: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    disabled: {
      pointerEvents: 'none',
      opacity: 0.7,
    },
    button: {
      marginTop: proposal.status.id === 0 ? '40px' : 'auto',
      marginLeft: '10px',
      backgroundColor: theme.palette.secondary.main,
      color: '#ffff',
      '&:hover': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
  }))();

  return (
    <>
      <ProposalQuestionaryReview
        data={proposal}
        className={readonly ? classes.disabled : undefined}
      />
      <div className={classes.buttons}>
        <NavigationFragment
          back={undefined}
          saveAndNext={{
            callback: () => {
              confirm(
                () => {
                  dispatch({
                    type: EventType.PROPOSAL_SUBMIT_CLICKED,
                    payload: { proposalId: proposal.id },
                  });
                },
                {
                  title: 'Please confirm',
                  description:
                    'I am aware that no further edits can be done after proposal submission.',
                }
              )();
            },
            label: proposal.submitted ? '✔ Submitted' : 'Submit',
            disabled: !allStepsComplete || proposal.submitted,
          }}
          reset={undefined}
          isLoading={false}
          disabled={proposal.status.id === 0}
        />
        <Button
          className={classes.button}
          onClick={() => downloadPDFProposal(proposal.id)}
          variant="contained"
          disabled={!allStepsComplete}
        >
          Download PDF
        </Button>
      </div>
    </>
  );
}

interface ProposalSummaryProps {
  data: ProposalSubmissionState;
  readonly: boolean;
  confirm: Function;
}
export default withConfirm(ProposalReview);
