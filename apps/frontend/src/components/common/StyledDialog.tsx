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
 * `fullScreen` defaults to true below the compact breakpoint. Pass `fullScreen={false}`
 * for short prompts, which read as broken when blown up to the whole viewport.
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

import MobileAppBar from 'components/common/mobile/MobileAppBar';
import { useIsMobile } from 'hooks/common/useResponsive';

const DialogHeader = styled('div')({
  display: 'flex',
  width: '100%',
  padding: '0 8px',
  alignContent: 'center',
});

type StyledDialogProps = {
  title?: string;
  error?: boolean;
  extra?: React.ReactNode;
  tooltip?: React.ReactNode;
} & DialogProps;

/**
 * True when this dialog already renders a mobile app bar, so nested content
 * that would render one of its own can leave it out.
 */
export const DialogAppBarContext = React.createContext(false);

function StyledDialog(props: StyledDialogProps) {
  const { extra, error, title, onClose } = props;
  const isMobile = useIsMobile();
  const asFullScreen = props.fullScreen ?? isMobile;

  return (
    <Dialog {...props} fullScreen={asFullScreen}>
      {asFullScreen ? (
        <MobileAppBar
          title={title ?? ''}
          variant="dialog"
          error={error}
          onBack={() => onClose?.({}, 'escapeKeyDown')}
          extra={
            <>
              {props.tooltip}
              {extra}
            </>
          }
        />
      ) : (
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
      )}
      <DialogAppBarContext.Provider value={asFullScreen}>
        {props.children}
      </DialogAppBarContext.Provider>
    </Dialog>
  );
}

export default StyledDialog;
