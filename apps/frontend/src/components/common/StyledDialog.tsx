/**
 * StyledDialog Component
 *
 * This is a customizable dialog component built on top of MUI's Dialog.
 * It adds optional title and close button functionality.
 *
 * Props:
 * - `title?: string`: Optional. The title displayed at the top of the dialog.
 * - `onClose?`: Optional. A callback function triggered when the close button
 *   is clicked or the dialog is closed with the 'Escape' key.
 *   Passes the event and a 'reason' string ('escapeKeyDown').
 * - `children`: The content of the dialog. Any components that can be
 *   placed inside MUI's Dialog can also be used inside StyledDialog.
 * - Additional props (`DialogProps`) are passed down to the underlying MUI Dialog component.
 *
 * Usage:
 * ```
 * <StyledDialog
 *   open={true}
 *   onClose={handleClose}
 *   title="Dialog Title"
 * >
 *   <DialogContent>
 *     Your content here.
 *   </DialogContent>
 * </StyledDialog>
 * ```
 */

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
