import { Button, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { ProposalStatus } from '../../generated/sdk';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useSubmitProposal } from '../../hooks/useSubmitProposal';
import {
  EventType,
  IProposalSubmissionModelState,
} from '../../models/ProposalSubmissionModel';
import withConfirm from '../../utils/withConfirm';
import ProposalQuestionaryReview from '../review/ProposalQuestionaryReview';
import { ProposalSubmissionContext } from './ProposalContainer';
import ProposalNavigationFragment from './ProposalNavigationFragment';

function ProposalReview({
  data,
  readonly,
  confirm,
}: {
  data: IProposalSubmissionModelState;
  readonly: boolean;
  confirm: Function;
}) {
  const { dispatch } = useContext(ProposalSubmissionContext)!;
  const { isLoading, submitProposal } = useSubmitProposal();
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
      marginTop: 'auto',
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
        <ProposalNavigationFragment
          back={undefined}
          saveAndNext={{
            callback: () => {
              confirm(
                () => {
                  submitProposal(proposal.id).then(isSubmitted => {
                    dispatch({
                      type: EventType.SUBMIT_PROPOSAL_CLICKED,
                      payload: proposal,
                    });
                  });
                },
                {
                  title: 'Please confirm',
                  description:
                    'I am aware that no further edits can be done after proposal submission.',
                }
              )();
            },
            label:
              proposal.status === ProposalStatus.SUBMITTED
                ? '✔ Submitted'
                : 'Submit',
            disabled:
              !allStepsComplete || proposal.status === ProposalStatus.SUBMITTED,
            isBusy: isLoading,
          }}
          reset={undefined}
          isLoading={false}
          disabled={false}
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

export default withConfirm(ProposalReview);
