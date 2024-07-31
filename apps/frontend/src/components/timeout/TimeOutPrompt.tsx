import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

type IdleTimeoutPromptProps = {
  isIdle: boolean;
  onConfirm: () => void;
};

function IdleTimeoutPrompt(props: IdleTimeoutPromptProps): JSX.Element {
  return (
    <Dialog fullWidth data-cy="timeout-dialog" open={props.isIdle}>
      <DialogTitle
        sx={(theme) => ({
          marginTop: theme.spacing(1.5),
          color: theme.palette.error.main,
        })}
      >
        {'Warning'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            'You are at risk of being logged out and losing any unsaved data due to inactivity. Please confirm you are still using the system'
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onConfirm} data-cy="confirm-idle" variant="text">
          {'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IdleTimeoutPrompt;
