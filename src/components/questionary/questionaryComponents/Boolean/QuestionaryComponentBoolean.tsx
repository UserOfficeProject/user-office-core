import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { getIn } from 'formik';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { BooleanConfig } from 'generated/sdk';

const useStyles = makeStyles({
  checkboxPadding: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export function QuestionaryComponentBoolean(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, question },
  } = answer;
  const config = answer.config as BooleanConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const [stateValue, setStateValue] = useState<boolean>(answer.value || false);

  useEffect(() => {
    setStateValue(answer.value || false);
  }, [answer]);

  const classes = useStyles();

  return (
    <FormControl
      error={isError}
      margin="dense"
      fullWidth
      required={config.required}
    >
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            name={id}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              onComplete(evt.target.checked);
            }}
            value={stateValue}
            checked={stateValue}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
            className={classes.checkboxPadding}
          />
        }
        label={
          <>
            {question}
            {config.small_label && (
              <>
                <br />
                <small>{config.small_label}</small>
              </>
            )}
            {config.required && (
              <span
                aria-hidden="true"
                className="MuiFormLabel-asterisk MuiInputLabel-asterisk"
              >
                 *
              </span>
            )}
          </>
        }
      />
      {isError && <FormHelperText>{fieldError}</FormHelperText>}
    </FormControl>
  );
}
