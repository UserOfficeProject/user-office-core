import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
}));

function InputDialog(props: DialogProps) {
  const classes = useStyles();

  return (
    <Dialog {...props}>
      <DialogContent className={classes.content}>
        {props.children}
      </DialogContent>
    </Dialog>
  );
}

export default InputDialog;
