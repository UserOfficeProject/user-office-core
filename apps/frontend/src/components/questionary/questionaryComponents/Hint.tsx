import { Box, BoxProps } from '@mui/material';
import React from 'react';
/**
 * Label with predefined styles.
 * Small, gray, italic
 * @param props Style overrides
 * @returns
 */
function Hint(props: BoxProps) {
  return (
    <Box
      {...props}
      sx={[
        {
          fontSize: 12,
          fontStyle: 'italic',
          color: '#888',
          marginTop: '4px',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {props.children}
    </Box>
  );
}

export default Hint;
