import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';

type IdleTimeoutPromptProps = {
  isIdle: boolean;
  onConfirm: () => void;
};

function IdleTimeoutPrompt(props: IdleTimeoutPromptProps): JSX.Element {
  return (
    <StyledDialog
      fullWidth
      maxWidth="md"
      data-cy="timeout-dialog"
      open={props.isIdle}
      title="Warning"
    >
      <DialogContent dividers>
        <DialogContentText>
          {
            'You are at risk of being logged out and losing any unsaved data due to inactivity. Please confirm you are still using the system'
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onConfirm} data-cy="confirm-idle" variant="text">
          {'Confirm'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

export default IdleTimeoutPrompt;
