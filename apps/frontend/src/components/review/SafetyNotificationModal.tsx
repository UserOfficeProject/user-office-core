import {
  Button,
  TextField,
  Autocomplete,
  Grid,
  Dialog,
  DialogContent,
  Typography,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  BasicUserDetails,
  EmailStatusActionEmailTemplate,
  ProposalStatusActionType,
  UserRole,
  EmailActionDefaultConfig,
} from 'generated/sdk';
import { useStatusActionsData } from 'hooks/settings/useStatusActionsData';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type SafetyNotificationModalProps = {
  proposalPk: number;
  users: BasicUserDetails[];
  show: boolean;
  close: () => void;
};

const SafetyNotificationModal = ({
  proposalPk,
  users,
  show,
  close,
}: SafetyNotificationModalProps) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailStatusActionEmailTemplate | null>(null);

  const { api } = useDataApiWithFeedback();
  const { statusActions, loadingStatusActions } = useStatusActionsData();
  const safetyManagers = useUsersData({ userRole: UserRole.SAFETY_MANAGER })
    .usersData.users;

  const emailActionDefaultConfig = statusActions.find(
    (action) => action.type === ProposalStatusActionType.EMAIL
  )?.defaultConfig as EmailActionDefaultConfig;

  const distinctReviewers: BasicUserDetails[] = users.reduce(
    (accumulator, reviewer) => {
      if (
        reviewer &&
        !accumulator.some(
          (existingReviewer) => existingReviewer.id === reviewer.id
        )
      ) {
        accumulator.push(reviewer);
      }

      return accumulator;
    },
    [] as BasicUserDetails[]
  );

  const safetyManagerEmails = distinctReviewers
    .filter(
      (user) =>
        user.email &&
        safetyManagers.some((manager) => manager.email === user.email)
    )
    .map((user) => user.email!);

  const sendButtonDisabled =
    !selectedTemplate || safetyManagerEmails.length === 0;

  const handleTemplateChange = (
    value: EmailStatusActionEmailTemplate | null
  ) => {
    setSelectedTemplate(value);
  };

  const emailSafety = async () => {
    await api({
      toastSuccessMessage: 'Notification to Safety Managers sent successfully',
    }).notifySafety({
      proposalPk,
      safetyManagerEmails: safetyManagerEmails,
      templateId: selectedTemplate!.id,
    });

    close();
  };

  return (
    <Dialog
      aria-labelledby="safety-notification-modal-title"
      aria-describedby="safety-notification-modal-description"
      open={show}
      onClose={close}
      disableScrollLock
      data-cy="safety-notification-modal"
    >
      <DialogContent>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h6" component="h2" gutterBottom>
              Notify Safety Reviewers
            </Typography>
            <p>
              If there are safety concerns related to this proposal, you can
              notify safety managers from the list of internal reviewers for
              further review and action.
            </p>
            <Autocomplete
              id="safety-template-list"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select template for Safety"
                  margin="none"
                />
              )}
              options={emailActionDefaultConfig?.emailTemplates || []}
              getOptionLabel={(option) => option.id}
              onChange={(_event, value) => handleTemplateChange(value)}
              disabled={loadingStatusActions}
              data-cy="safety-notification-modal-template-select"
            />
          </Grid>
        </Grid>
        <ActionButtonContainer>
          <Tooltip
            title="Template is not selected or there are no safety managers in the reviews"
            disableHoverListener={!sendButtonDisabled}
          >
            <span>
              {/* Span needed because Tooltip children can't be disabled */}
              <Button
                type="button"
                color="primary"
                onClick={emailSafety}
                disabled={sendButtonDisabled}
                data-cy="safety-notification-modal-send-button"
              >
                Send notification
              </Button>
            </span>
          </Tooltip>
        </ActionButtonContainer>
      </DialogContent>
    </Dialog>
  );
};

export default SafetyNotificationModal;
