import { CircularProgress, CircularProgressProps } from '@material-ui/core';
import React from 'react';

const UOLoader: React.FC<CircularProgressProps> = props => (
  <CircularProgress {...props} />
);

export default UOLoader;
