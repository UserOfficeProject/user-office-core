import { Grid, Alert, AlertProps } from '@mui/material';
import React from 'react';

/** Message occupying full screen and displaying slightly customized MUI Alert component */
function CenteredAlert(props: AlertProps) {
  return (
    <Grid
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Alert
        variant="filled"
        sx={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px',
          borderRadius: '10px',
          '& div': {
            padding: 0,
          },
          '& .MuiAlert-action': {
            paddingLeft: '40px',
            paddingRight: '10px',
          },
          '& .MuiAlert-message': {
            overflow: 'visible',
          },
        }}
        {...props}
      ></Alert>
    </Grid>
  );
}

export default CenteredAlert;
