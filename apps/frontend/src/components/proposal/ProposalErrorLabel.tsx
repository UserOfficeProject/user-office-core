import Box, { BoxProps } from '@mui/material/Box';
import React, { PropsWithChildren } from 'react';

const ProposalErrorLabel = ({
  children,
  ...props
}: PropsWithChildren<BoxProps<'span'>>) => (
  <Box
    component="span"
    sx={(theme) => ({
      color: theme.palette.error.main,
      fontSize: '12px',
      fontWeight: 400,
    })}
    {...props}
  >
    {children}
  </Box>
);

export default ProposalErrorLabel;
