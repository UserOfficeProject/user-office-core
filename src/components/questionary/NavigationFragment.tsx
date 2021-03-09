import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { Fragment } from 'react';

import UOLoader from 'components/common/UOLoader';
const useStyles = makeStyles({
  buttons: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'flex-end',
    '& > *': {
      margin: '25px 5px 0 10px',
      '&:first-child': {
        marginLeft: '0',
      },
      '&:last-child': {
        marginRight: '0',
      },
    },
  },
});

const NavigationFragment = (props: {
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}): JSX.Element | null => {
  const classes = useStyles();

  if (props.disabled) {
    return null;
  }

  return (
    <div className={classes.buttons}>
      {props.isLoading ? <UOLoader /> : <Fragment>{props.children}</Fragment>}
    </div>
  );
};

export default NavigationFragment;
