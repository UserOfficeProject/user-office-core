import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useState, Dispatch, SetStateAction } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { UserRole } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';

import AssignTechnicalReview from './AssignTechnicalReview';

type ProposalTechnicalReviewerAssignmentProps = {
  proposalData: ProposalData;
  setProposalData: Dispatch<SetStateAction<ProposalData | null>>;
};

const useStyles = makeStyles((theme) => ({
  reassignContainer: {
    padding: theme.spacing(2),
    marginTop: 0,
    marginBottom: theme.spacing(6),
  },
  reassignContainerDisabled: {
    pointerEvents: 'none',
    opacity: '0.5',
  },
}));

const ProposalTechnicalReviewerAssignment: React.FC<
  ProposalTechnicalReviewerAssignmentProps
> = ({ proposalData, setProposalData }) => {
  const classes = useStyles();
  const [showReassign, setShowReassign] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  return (
    <Paper
      elevation={1}
      className={clsx(
        classes.reassignContainer,
        !isUserOfficer &&
          proposalData.technicalReview?.submitted &&
          classes.reassignContainerDisabled
      )}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Assign to someone else?
      </Typography>
      <p>
        If you think there is a better candidate to do the review for the
        proposal, you can re-assign it to someone else
      </p>
      <>
        {proposalData.technicalReview?.technicalReviewAssigneeId !== null ||
        showReassign ? (
          <AssignTechnicalReview
            proposal={proposalData}
            onProposalUpdated={(updatedProposal) => {
              setProposalData(updatedProposal);
            }}
          />
        ) : (
          <Button
            onClick={() => setShowReassign(true)}
            variant="text"
            data-cy="re-assign"
          >
            Re-assign...
          </Button>
        )}
      </>
    </Paper>
  );
};

export default ProposalTechnicalReviewerAssignment;
