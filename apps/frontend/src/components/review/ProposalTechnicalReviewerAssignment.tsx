import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { UserRole } from 'generated/sdk';
import {
  ProposalDataInstrument,
  ProposalDataTechnicalReview,
} from 'hooks/proposal/useProposalData';

import AssignTechnicalReview from './AssignTechnicalReview';

type ProposalTechnicalReviewerAssignmentProps = {
  technicalReview: ProposalDataTechnicalReview;
  instrument: ProposalDataInstrument;
  onTechnicalReviewUpdated: (
    updatedTechnicalReview: ProposalDataTechnicalReview
  ) => void;
};

const ProposalTechnicalReviewerAssignment = ({
  technicalReview,
  instrument,
  onTechnicalReviewUpdated,
}: ProposalTechnicalReviewerAssignmentProps) => {
  const [showReassign, setShowReassign] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);

  return (
    <Paper
      elevation={1}
      sx={(theme) => ({
        padding: theme.spacing(2),
        marginTop: 0,
        marginBottom: theme.spacing(2),
        ...(!isUserOfficer &&
          technicalReview?.submitted && {
            pointerEvents: 'none',
            opacity: '0.5',
          }),
      })}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Assign to someone else?
      </Typography>
      <p>
        If you think there is a better candidate to do the review for the
        proposal, you can re-assign it to someone else
      </p>
      <>
        {technicalReview?.technicalReviewAssigneeId !== null || showReassign ? (
          <AssignTechnicalReview
            technicalReview={technicalReview}
            instrument={instrument}
            onTechnicalReviewUpdated={onTechnicalReviewUpdated}
          />
        ) : (
          <Button
            onClick={() => setShowReassign(true)}
            variant="text"
            data-cy="re-assign"
            disabled={isInternalReviewer}
          >
            Re-assign...
          </Button>
        )}
      </>
    </Paper>
  );
};

export default ProposalTechnicalReviewerAssignment;
