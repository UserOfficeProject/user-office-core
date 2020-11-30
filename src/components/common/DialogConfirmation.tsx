import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

function DialogConfirmation({
  title,
  text,
  action,
  handleOpen,
  open,
}: {
  open: boolean;
  title: string;
  text: string;
  action: () => void;
  handleOpen: (arg0: boolean) => void;
}) {
  function handleClose() {
    handleOpen(false);
  }

  function handleAccept() {
    action();
    handleOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-cy="confirm-cancel" onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          data-cy="confirm-yes"
          onClick={handleAccept}
          color="primary"
          autoFocus
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogConfirmation;
