import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import React from 'react';

const UOLoader: React.FC<CircularProgressProps> = props => (
  <CircularProgress {...props} />
);

export default UOLoader;
