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
import { styled } from '@mui/material/styles';
import React from 'react';

const DialogHeader = styled('div')({
  display: 'flex',
  width: '100%',
  padding: '0 8px',
  alignContent: 'center',
});

type StyledDialogProps = {
  title?: string;
  error?: boolean;
  extra?: JSX.Element;
  tooltip?: React.ReactNode
} & DialogProps;

function StyledDialog(props: StyledDialogProps) {
  const { extra, error, title, onClose } = props;

  return (
    <Dialog {...props}>
      <DialogHeader>
        <DialogTitle
          id="customized-dialog-title"
          sx={(theme) => ({
            flex: 1,
            color: error
              ? theme.palette.error.main
              : theme.palette.primary.main,
          })}
        >
          {title}
          {props.tooltip && props.tooltip}
        </DialogTitle>
        {extra}

        {onClose && (
          <IconButton
            data-cy="close-modal-btn"
            aria-label="close"
            onClick={(e) => onClose?.(e, 'escapeKeyDown')}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogHeader>
      {props.children}
    </Dialog>
  );
}

export default StyledDialog;
