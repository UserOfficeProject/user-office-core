import { makeStyles } from '@material-ui/core';
import React, { PropsWithChildren } from 'react';

import { ButtonContainer } from '../../styles/StyledComponents';

export function ActionButtonContainer(props: PropsWithChildren<{}>) {
  const classes = makeStyles(theme => ({
    buttonContainer: {
      justifyItems: 'flex-end',
      marginTop: theme.spacing(3),
      '& button': {
        marginLeft: theme.spacing(2),
      },
    },
  }))();

  return (
    <ButtonContainer className={classes.buttonContainer}>
      {props.children}
    </ButtonContainer>
  );
}
