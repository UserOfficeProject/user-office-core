import { BoxProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';

import { StyledButtonContainer } from 'styles/StyledComponents';

export function ActionButtonContainer({
  children,
  ...rest
}: PropsWithChildren<BoxProps>) {
  return (
    <StyledButtonContainer
      sx={(theme) => ({
        justifyItems: 'flex-end',
        marginTop: theme.spacing(3),
        '& button': {
          marginLeft: theme.spacing(2),
        },
      })}
      {...rest}
    >
      {children}
    </StyledButtonContainer>
  );
}
