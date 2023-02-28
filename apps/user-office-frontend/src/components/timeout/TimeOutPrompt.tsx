import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

type IdleTimeoutPromptProps = {
  isIdle: boolean;
  onConfirm: () => void;
};

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: '12px',
    color: theme.palette.error.main,
  },
  body: {
    display: 'grid',
    placeItems: 'center',
  },
}));

function IdleTimeoutPrompt(props: IdleTimeoutPromptProps): JSX.Element {
  const classes = useStyles();

  return (
    <Dialog fullWidth data-cy="timeout-dialog" open={props.isIdle}>
      <DialogTitle className={classes.title}>{'Warning'}</DialogTitle>
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
