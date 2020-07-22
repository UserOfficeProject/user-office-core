import {
  Checkbox,
  FormControl,
  FormControlLabel,
  makeStyles,
} from '@material-ui/core';
import { getIn } from 'formik';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { BasicComponentProps } from './IBasicComponentProps';
import ProposalErrorLabel from './ProposalErrorLabel';

export function ProposalComponentBoolean(props: BasicComponentProps) {
  const { templateField, errors, onComplete, touched } = props;
  const {
    question: { proposalQuestionId, question },
    config,
  } = templateField;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
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
            id={proposalQuestionId}
            name={proposalQuestionId}
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
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
