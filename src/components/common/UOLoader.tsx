import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  button: {
    width: `calc(${theme.typography.button.lineHeight} * ${theme.typography.button.fontSize}) !important`,
    height: `calc(${theme.typography.button.lineHeight} * ${theme.typography.button.fontSize}) !important`,
  },
}));

const UOLoader: React.FC<
  CircularProgressProps & {
    buttonSized?: boolean;
  }
> = ({ buttonSized, ...props }) => {
  const classes = useStyles();

  return (
    <CircularProgress
      className={clsx({ [classes.button]: buttonSized })}
      data-cy="UO-loader"
      {...props}
    />
  );
};

export default UOLoader;
