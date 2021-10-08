import { makeStyles } from '@material-ui/core';
import { ErrorMessage as FormikErrorMessage, ErrorMessageProps } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  error: {
    color: theme.palette.primary.main,
    margin: theme.spacing(2),
  },
}));
/**
 * Error message for Formik forms with applied styles
 * @param props
 * @returns
 */
function ErrorMessage(props: ErrorMessageProps) {
  const classes = useStyles();

  return (
    <FormikErrorMessage className={classes.error} {...props} component="span" />
  );
}

export default ErrorMessage;
