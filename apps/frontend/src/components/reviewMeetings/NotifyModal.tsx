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
  EmailStatusActionEmailTemplate,
  ProposalStatusActionType,
  EmailActionDefaultConfig,
  ReviewMeetingFragment,
} from 'generated/sdk';
import { useStatusActionsData } from 'hooks/settings/useStatusActionsData';

type NotifyModalProps = {
  reviewMeeting?: ReviewMeetingFragment;
  handleNotify: (
    reviewMeeting: ReviewMeetingFragment,
    selectedTemplate: EmailStatusActionEmailTemplate
  ) => void;
  show: boolean;
  close: () => void;
};

const NotifyModal = ({
  reviewMeeting,
  handleNotify,
  show,
  close,
}: NotifyModalProps) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailStatusActionEmailTemplate | null>(null);

  const { statusActions, loadingStatusActions } = useStatusActionsData();

  const emailActionDefaultConfig = statusActions.find(
    (action) => action.type === ProposalStatusActionType.EMAIL
  )?.defaultConfig as EmailActionDefaultConfig;

  const sendButtonDisabled =
    !selectedTemplate ||
    !reviewMeeting ||
    reviewMeeting.participants.length === 0;

  const handleTemplateChange = (
    value: EmailStatusActionEmailTemplate | null
  ) => {
    setSelectedTemplate(value);
  };

  const handleClose = () => {
    close();
    setSelectedTemplate(null);
  };

  return (
    <Dialog
      aria-labelledby="safety-notification-modal-title"
      aria-describedby="safety-notification-modal-description"
      open={show}
      onClose={handleClose}
      disableScrollLock
      data-cy="safety-notification-modal"
    >
      <DialogContent>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h6" component="h2" gutterBottom>
              Notify participant of the meeting
            </Typography>
            <Autocomplete
              id="notify-template-list"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select template to send"
                  margin="none"
                />
              )}
              options={emailActionDefaultConfig?.emailTemplates || []}
              getOptionLabel={(option) => option.id}
              onChange={(_event, value) => handleTemplateChange(value)}
              disabled={loadingStatusActions}
              data-cy="notify-modal-template-select"
            />
          </Grid>
        </Grid>
        <ActionButtonContainer>
          <Tooltip
            title="Template is not selected or there are no recipients"
            disableHoverListener={!sendButtonDisabled}
          >
            <span>
              {/* Span needed because Tooltip children can't be disabled */}
              <Button
                type="button"
                color="primary"
                onClick={() => {
                  handleNotify(reviewMeeting!, selectedTemplate!);
                  handleClose();
                }}
                disabled={sendButtonDisabled}
                data-cy="notify-modal-send-button"
              >
                Send email
              </Button>
            </span>
          </Tooltip>
        </ActionButtonContainer>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyModal;
