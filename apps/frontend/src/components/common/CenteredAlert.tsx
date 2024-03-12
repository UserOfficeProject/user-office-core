import { Grid, Alert, AlertProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  grid: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  alert: {
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
  },
}));

/** Message occupying full screen and displaying slightly customized MUI Alert component */
function CenteredAlert(props: AlertProps) {
  const classes = useStyles();

  return (
    <Grid className={classes.grid}>
      <Alert variant="filled" className={classes.alert} {...props}></Alert>
    </Grid>
  );
}

export default CenteredAlert;
