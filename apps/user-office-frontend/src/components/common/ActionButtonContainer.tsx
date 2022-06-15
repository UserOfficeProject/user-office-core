import makeStyles from '@mui/styles/makeStyles';
import React, { PropsWithChildren } from 'react';

import { StyledButtonContainer } from 'styles/StyledComponents';

const useStyles = makeStyles((theme) => ({
  StyledButtonContainer: {
    justifyItems: 'flex-end',
    marginTop: theme.spacing(3),
    '& button': {
      marginLeft: theme.spacing(2),
    },
  },
}));

export function ActionButtonContainer({
  children,
  ...rest
}: PropsWithChildren<Record<string, unknown>>) {
  const classes = useStyles();

  return (
    <StyledButtonContainer className={classes.StyledButtonContainer} {...rest}>
      {children}
    </StyledButtonContainer>
  );
}
