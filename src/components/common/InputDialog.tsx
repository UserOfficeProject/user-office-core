import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
}));

function InputDialog(props: DialogProps) {
  const classes = useStyles();

  return (
    <Dialog maxWidth="sm" {...props}>
      <DialogContent className={classes.content}>
        {props.children}
      </DialogContent>
    </Dialog>
  );
}

export default InputDialog;
