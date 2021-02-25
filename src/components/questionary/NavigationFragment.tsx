import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { Fragment } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';

const NavigationFragment = (props: {
  back?: ButtonConfig;
  reset?: ButtonConfig;
  save?: ButtonConfig;
  saveAndNext?: ButtonConfig;
  isLoading?: boolean;
  disabled?: boolean;
}): JSX.Element => {
  if (props.disabled === true) {
    return <div></div>;
  }
  const classes = makeStyles({
    buttons: {
      marginTop: '15px',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    button: {
      margin: '25px 10px 0 10px',
      '&:first-child': {
        marginLeft: '0',
      },
      '&:last-child': {
        marginRight: '0',
      },
    },
    lastLeftButton: {
      marginRight: 'auto',
    },
  })();

  const backButton = props.back ? (
    <NavigButton
      onClick={() => props.back?.callback()}
      className={`${classes.button} ${classes.lastLeftButton}`}
      type="button"
      disabled={props.back.disabled}
      isBusy={props.back.isBusy}
    >
      {props.back.label || 'Back'}
    </NavigButton>
  ) : null;
  const resetButton = props.reset ? (
    <NavigButton
      onClick={() => props.reset?.callback()}
      className={classes.button}
      type="button"
      disabled={props.reset.disabled}
      isBusy={props.reset.isBusy}
    >
      {props.reset.label || 'Reset'}
    </NavigButton>
  ) : null;
  const saveButton = props.save ? (
    <NavigButton
      onClick={() => props.save?.callback()}
      className={classes.button}
      type="button"
      variant="contained"
      color="primary"
      disabled={props.save.disabled}
      isBusy={props.save.isBusy}
    >
      {props.save.label || 'Save'}
    </NavigButton>
  ) : null;
  const saveAndNextButton = props.saveAndNext ? (
    <NavigButton
      onClick={() => props.saveAndNext?.callback()}
      className={classes.button}
      type="button"
      variant="contained"
      color="primary"
      disabled={props.saveAndNext.disabled}
      isBusy={props.saveAndNext.isBusy}
      data-cy="save-and-continue-button"
    >
      {props.saveAndNext.label || 'Save and continue'}
    </NavigButton>
  ) : null;
  const buttonArea = props.isLoading ? (
    <UOLoader />
  ) : (
    <Fragment>
      {backButton}
      {resetButton}
      {saveButton}
      {saveAndNextButton}
    </Fragment>
  );

  return <div className={classes.buttons}>{buttonArea}</div>;
};

export default NavigationFragment;

interface ButtonConfig {
  callback: () => void;
  label?: string;
  disabled?: boolean;
  isBusy?: boolean;
}
