import {
  Checkbox,
  FormControl,
  FormControlLabel,
  makeStyles,
} from '@material-ui/core';
import { getIn } from 'formik';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { IBasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';

export function ProposalComponentBoolean(props: IBasicComponentProps) {
  const { templateField, errors, onComplete, touched } = props;
  const { proposal_question_id, config, question } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const [stateValue, setStateValue] = useState<boolean>(
    templateField.value || false
  );

  useEffect(() => {
    setStateValue(templateField.value || false);
  }, [templateField]);

  const classes = makeStyles({
    label: {
      marginRight: '5px',
    },
  })();

  return (
    <FormControl error={isError}>
      <FormControlLabel
        control={
          <Checkbox
            id={proposal_question_id}
            name={proposal_question_id}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              onComplete(evt, evt.target.checked);
            }}
            value={stateValue}
            checked={stateValue}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
            required={config.required ? true : false}
          />
        }
        label={question}
        className={classes.label}
      />
      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
