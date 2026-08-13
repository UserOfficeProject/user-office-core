import { BoxProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';

import { belowCompactUi } from 'hooks/common/useResponsive';
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
        // Right-aligned buttons sized to their text are too small to hit on a
        // phone; share the width instead.
        [belowCompactUi(theme)]: {
          gap: theme.spacing(1),
          '& button': {
            marginLeft: 0,
            flex: 1,
          },
        },
      })}
      {...rest}
    >
      {children}
    </StyledButtonContainer>
  );
}
