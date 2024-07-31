import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import React from 'react';

const UOLoader = ({
  buttonSized,
  ...props
}: CircularProgressProps & {
  buttonSized?: boolean;
}) => (
  <CircularProgress
    sx={(theme) => ({
      ...(buttonSized && {
        width: `calc(${theme.typography.button.lineHeight} * ${theme.typography.button.fontSize}) !important`,
        height: `calc(${theme.typography.button.lineHeight} * ${theme.typography.button.fontSize}) !important`,
      }),
    })}
    data-cy="UO-loader"
    {...props}
  />
);

export default UOLoader;
