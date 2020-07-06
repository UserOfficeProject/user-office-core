import {
  Dialog,
  DialogContent,
  DialogProps,
  makeStyles,
} from '@material-ui/core';
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
