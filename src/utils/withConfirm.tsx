import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useState } from 'react';

import { FunctionType } from './utilTypes';

const defaultOptions = {
  title: '',
  description: '',
  confirmationText: 'OK',
  cancellationText: 'Cancel',
  alertText: '',
  dialogProps: {},
  onClose: (): void => {},
  onCancel: (): void => {},
};

const useStyles = makeStyles(() => ({
  title: {
    marginTop: '12px',
  },
}));

function withConfirm<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithConfirmComponent(props: Omit<T, 'confirm'>): JSX.Element {
    const classes = useStyles();
    const [onConfirm, setOnConfirm] = useState<FunctionType | null>(null);
    const [options, setOptions] = useState(defaultOptions);
    const {
      title,
      description,
      confirmationText,
      cancellationText,
      dialogProps,
      alertText,
      onClose,
      onCancel,
    } = options;
    const handleClose = useCallback(() => {
      onClose();
      setOnConfirm(null);
    }, [onClose]);
    const handleCancel = useCallback(() => {
      onCancel();
      handleClose();
    }, [onCancel, handleClose]);
    const handleConfirm = useCallback(
      (...args) => {
        if (onConfirm) {
          onConfirm(...args);
        }
        handleClose();
      },
      [onConfirm, handleClose]
    );
    /* Returns function opening the dialog, passed to the wrapped component. */
    const confirm = useCallback(
      (onConfirm, options: Options) => (): void => {
        setOnConfirm(() => onConfirm);
        setOptions({ ...defaultOptions, ...options });
      },
      []
    );

    return (
      <>
        <WrappedComponent {...(props as T)} confirm={confirm} />
        <Dialog
          fullWidth
          {...dialogProps}
          open={!!onConfirm}
          onClose={handleCancel}
          data-cy="confirmation-dialog"
        >
          {title && (
            <DialogTitle className={classes.title}>{title}</DialogTitle>
          )}
          {description && (
            <DialogContent>
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
              disabled={!!alertText}
            >
              {confirmationText}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
}

interface Options {
  title: string;
  description: string;
  confirmationText?: string;
  cancellationText?: string;
  alertText?: string;
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
