import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { PropsWithChildren } from 'react';

import { ButtonContainer } from 'styles/StyledComponents';

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    justifyItems: 'flex-end',
    marginTop: theme.spacing(3),
    '& button': {
      marginLeft: theme.spacing(2),
    },
  },
}));

export function ActionButtonContainer(
  props: PropsWithChildren<Record<string, unknown>>
) {
  const classes = useStyles();

  return (
    <ButtonContainer className={classes.buttonContainer}>
      {props.children}
    </ButtonContainer>
  );
}
