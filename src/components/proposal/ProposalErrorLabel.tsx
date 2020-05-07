import { makeStyles } from '@material-ui/core';
import React from 'react';
export function ProposalErrorLabel(props: any) {
  const classes = makeStyles(theme => ({
    error: {
      color: theme.palette.error.main,
      fontSize: '12px',
      fontWeight: 400,
    },
  }))();

  return <span className={classes.error}>{props.children}</span>;
}
