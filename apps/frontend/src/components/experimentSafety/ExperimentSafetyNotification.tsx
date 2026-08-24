import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import { alpha, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';

import {
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
  GetExperimentSafetyQuery,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

interface ExperimentSafetyNotificationProps {
  experimentSafety: GetExperimentSafetyQuery['experimentSafety'];
}

const ExperimentSafetyNotification = ({
  experimentSafety,
}: ExperimentSafetyNotificationProps) => {
  if (!experimentSafety) {
    return null;
  }

  const statusId = experimentSafety.statusId;
  const instrumentScientistDecision =
    experimentSafety.instrumentScientistDecision;
  const experimentSafetyReviewerDecision =
    experimentSafety.experimentSafetyReviewerDecision;
  const instrumentScientistComment =
    experimentSafety.instrumentScientistComment;
  const experimentSafetyReviewerComment =
    experimentSafety.experimentSafetyReviewerComment;

  // Don't show notification for fresh AWAITING_ESF applications
  if (
    statusId === 'AWAITING_ESF' &&
    instrumentScientistDecision !== InstrumentScientistDecisionEnum.REJECTED &&
    experimentSafetyReviewerDecision !==
      ExperimentSafetyReviewerDecisionEnum.REJECTED
  ) {
    return null;
  }

  // Determine the notification type and message
  let notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';
  let title: string = '';
  let message: string = '';
  let icon: React.ReactNode = null;
  let showResubmitInfo: boolean = false;
  const comments: string[] = [];

  if (statusId === 'ESF_REJECTED') {
    // Final rejection - cannot resubmit
    notificationType = 'error';
    title = 'Experiment Safety Review Rejected';
    message =
      'Your Experiment Safety Review has been rejected and cannot be resubmitted.';
    icon = <WarningIcon />;

    if (
      instrumentScientistDecision ===
        InstrumentScientistDecisionEnum.REJECTED &&
      instrumentScientistComment
    ) {
      comments.push(instrumentScientistComment);
    }
    if (
      experimentSafetyReviewerDecision ===
        ExperimentSafetyReviewerDecisionEnum.REJECTED &&
      experimentSafetyReviewerComment
    ) {
      comments.push(experimentSafetyReviewerComment);
    }
  } else if (
    statusId === 'AWAITING_ESF' &&
    (instrumentScientistDecision === InstrumentScientistDecisionEnum.REJECTED ||
      experimentSafetyReviewerDecision ===
        ExperimentSafetyReviewerDecisionEnum.REJECTED)
  ) {
    // Rejection with resubmit opportunity
    notificationType = 'warning';
    title = 'Experiment Safety Review Rejected';

    if (
      instrumentScientistDecision ===
        InstrumentScientistDecisionEnum.REJECTED &&
      instrumentScientistComment
    ) {
      comments.push(instrumentScientistComment);
    }
    if (
      experimentSafetyReviewerDecision ===
        ExperimentSafetyReviewerDecisionEnum.REJECTED &&
      experimentSafetyReviewerComment
    ) {
      comments.push(experimentSafetyReviewerComment);
    }

    message =
      comments.length > 0
        ? 'Your Experiment Safety Review has been rejected. You have the opportunity to revise and resubmit your form.'
        : 'Your Experiment Safety Review has been rejected. Please reach out to the user officer for further guidance.';
    icon = <WarningIcon />;
    showResubmitInfo = true;
  } else if (statusId === 'ESF_APPROVED') {
    // Approved
    notificationType = 'success';
    title = 'Experiment Safety Review Approved';
    message = 'Your Experiment Safety Review has been approved successfully.';
    icon = <CheckCircleIcon />;
  } else {
    // Processing/Other states
    notificationType = 'info';
    title = 'Experiment Safety Review Under Review';
    message =
      'Your Experiment Safety Review is currently being processed. Please check back later for updates.';
    icon = <InfoIcon />;
  }

  // Map notification type to colors
  const colorMap: Record<
    'success' | 'error' | 'warning' | 'info',
    {
      bg: (theme: Theme) => string;
      border: (theme: Theme) => string;
      text: string;
    }
  > = {
    success: {
      bg: (theme: Theme) => alpha(theme.palette.success.main, 0.12),
      border: (theme: Theme) =>
        `1px solid ${alpha(theme.palette.success.main, 0.5)}`,
      text: 'success.main',
    },
    error: {
      bg: (theme: Theme) => alpha(theme.palette.error.main, 0.12),
      border: (theme: Theme) =>
        `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
      text: 'error.main',
    },
    warning: {
      bg: (theme: Theme) => alpha(theme.palette.warning.main, 0.12),
      border: (theme: Theme) =>
        `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
      text: 'warning.main',
    },
    info: {
      bg: (theme: Theme) => alpha(theme.palette.info.main, 0.12),
      border: (theme: Theme) =>
        `1px solid ${alpha(theme.palette.info.main, 0.5)}`,
      text: 'info.main',
    },
  };

  const colors = colorMap[notificationType];

  return (
    <StyledPaper
      data-testid="experiment-safety-notification"
      sx={{
        backgroundColor: colors.bg,
        border: colors.border,
        color: colors.text,
        borderRadius: 1,
        padding: 2,
        marginBottom: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 'fit-content',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {message}
        </Typography>
        {showResubmitInfo && (
          <Typography variant="body2" color="textSecondary">
            {comments.length > 0
              ? 'Please review the feedback provided and make the necessary corrections before resubmitting.'
              : 'In case of any queries, please reach out to the user officer for further guidance.'}
          </Typography>
        )}
        {comments.length > 0 && (
          <Box sx={{ marginTop: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Feedback:
            </Typography>
            {comments.map((comment, index) => (
              <Typography
                key={index}
                variant="body2"
                color="textSecondary"
                sx={{ marginTop: 0.5, marginLeft: 1 }}
              >
                • {comment}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </StyledPaper>
  );
};

export default ExperimentSafetyNotification;
