import CloseIcon from '@mui/icons-material/Close';
import { DialogTitle, IconButton } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import React from 'react';
function StyledDialog(props: DialogProps & { title?: string }) {
  return (
    <Dialog {...props}>
      {props.title && (
        <DialogTitle id="customized-dialog-title">{props.title}</DialogTitle>
      )}
      {props.onClose && (
        <IconButton
          aria-label="close"
          onClick={(e) => props.onClose?.(e, 'escapeKeyDown')}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {props.children}
    </Dialog>
  );
}

export default StyledDialog;
