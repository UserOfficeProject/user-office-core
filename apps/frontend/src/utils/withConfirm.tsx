import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import React, { ReactElement, useCallback, useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';

import { FunctionType } from './utilTypes';

const defaultOptions = {
  title: '',
  description: null,
  confirmationText: 'OK',
  cancellationText: 'Cancel',
  alertText: null,
  shouldEnableOKWithAlert: false,
  dialogProps: {},
  onClose: (): void => {},
  onCancel: (): void => {},
};

function withConfirm<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithConfirmComponent(props: Omit<T, 'confirm'>): JSX.Element {
    const [onConfirm, setOnConfirm] = useState<FunctionType | null>(null);
    const [options, setOptions] = useState<Options>(defaultOptions);
    const {
      title,
      description,
      confirmationText,
      cancellationText,
      dialogProps,
      alertText,
      shouldEnableOKWithAlert,
      onClose,
      onCancel,
    } = options;
    const handleClose = useCallback(() => {
      onClose?.();
      setOnConfirm(null);
    }, [onClose]);
    const handleCancel = useCallback(() => {
      onCancel?.();
      handleClose();
    }, [onCancel, handleClose]);
    const handleConfirm = useCallback(
      (...args: [event: React.MouseEvent<HTMLButtonElement, MouseEvent>]) => {
        if (onConfirm) {
          onConfirm(...args);
        }
        handleClose();
      },
      [onConfirm, handleClose]
    );
    /* Returns function opening the dialog, passed to the wrapped component. */
    const confirm = useCallback(
      (onConfirm: FunctionType, options: Options) => (): void => {
        setOnConfirm(() => onConfirm);

        setOptions({
          ...defaultOptions,
          ...options,
        });
      },
      []
    );

    return (
      <>
        <WrappedComponent {...(props as T)} confirm={confirm} />
        <StyledDialog
          fullWidth
          {...dialogProps}
          open={!!onConfirm}
          onClose={handleCancel}
          data-cy="confirmation-dialog"
          title={title}
        >
          {description && (
            <DialogContent dividers>
              <DialogContentText>{description}</DialogContentText>
              {alertText && <Alert severity="warning">{alertText}</Alert>}
            </DialogContent>
          )}
          <DialogActions>
            <Button
              variant="text"
              color="error"
              onClick={handleCancel}
              data-cy="confirm-cancel"
            >
              {cancellationText}
            </Button>
            <Button
              onClick={handleConfirm}
              data-cy="confirm-ok"
              variant="text"
              disabled={!shouldEnableOKWithAlert && !!alertText}
            >
              {confirmationText}
            </Button>
          </DialogActions>
        </StyledDialog>
      </>
    );
  };
}

interface Options {
  title: string;
  description: ReactElement | string | null;
  confirmationText?: string;
  cancellationText?: string;
  shouldEnableOKWithAlert?: boolean;
  alertText?: ReactElement | string | null;
  dialogProps?: Record<string, unknown>;
  onClose?: FunctionType;
  onCancel?: FunctionType;
}

export type WithConfirmType = (
  callback: FunctionType,
  params: Options
) => FunctionType;

export interface WithConfirmProps {
  confirm: WithConfirmType;
}

export default withConfirm;
