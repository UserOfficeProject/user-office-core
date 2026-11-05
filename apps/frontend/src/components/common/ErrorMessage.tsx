import { Box, BoxProps } from '@mui/material';
import { ErrorMessage as FormikErrorMessage, ErrorMessageProps } from 'formik';
import React from 'react';

/**
 * Error message for Formik forms with applied styles
 * @param props
 * @returns
 */
function ErrorMessage(props: Pick<ErrorMessageProps, 'name'> & BoxProps) {
  const { name, ...boxProps } = props;

  return (
    <Box
      {...boxProps}
      sx={[
        {
          color: 'error.main',
          fontSize: 'small',
          mt: 0.5,
        },
        ...(Array.isArray(boxProps.sx) ? boxProps.sx : [boxProps.sx]),
      ]}
    >
      <FormikErrorMessage name={name} component="span" />
    </Box>
  );
}

export default ErrorMessage;
