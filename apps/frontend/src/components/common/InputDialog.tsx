import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';

function InputDialog(props: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        sx={(theme) => ({
          padding: theme.spacing(3),
          marginTop: theme.spacing(2),
        })}
      >
        {props.children}
      </DialogContent>
    </Dialog>
  );
}

export default InputDialog;
