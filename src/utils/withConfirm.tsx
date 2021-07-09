import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Alert from '@material-ui/lab/Alert';
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

const withConfirm = <T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>
) => {
  return function WithConfirmComponent(props: Omit<T, 'confirm'>): JSX.Element {
    const classes = makeStyles(() => ({
      title: {
        marginTop: '12px',
      },
    }))();
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
        >
          {title && (
            <DialogTitle className={classes.title} disableTypography={true}>
              <Typography variant="h6" component="h1" gutterBottom>
                {title}
              </Typography>
            </DialogTitle>
          )}
          {description && (
            <DialogContent>
              <DialogContentText>{description}</DialogContentText>
              {alertText && <Alert severity="warning">{alertText}</Alert>}
            </DialogContent>
          )}
          <DialogActions>
            <Button onClick={handleCancel}>{cancellationText}</Button>
            <Button
              onClick={handleConfirm}
              color="primary"
              data-cy="confirm-ok"
              disabled={!!alertText}
            >
              {confirmationText}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
};

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

export default withConfirm;
