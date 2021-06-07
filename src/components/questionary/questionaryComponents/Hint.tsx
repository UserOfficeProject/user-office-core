import { Box, BoxProps } from '@material-ui/core';
import React from 'react';
/**
 * Label with predefined styles.
 * Small, gray, italic
 * @param props Style overrides
 * @returns
 */
function Hint(props: BoxProps) {
  return (
    <Box fontSize={12} fontStyle="italic" color="#888" {...props}>
      {props.children}
    </Box>
  );
}

export default Hint;
