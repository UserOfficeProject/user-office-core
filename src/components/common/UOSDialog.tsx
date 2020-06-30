import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogProps,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  dialog: {
    padding: theme.spacing(3),
  },
}));

function UOSDialog(props: DialogProps) {
  const classes = useStyles();
  return (
    <Dialog maxWidth="sm" {...props}>
      <DialogContent className={classes.dialog}>{props.children}</DialogContent>
    </Dialog>
  );
}

export default UOSDialog;
