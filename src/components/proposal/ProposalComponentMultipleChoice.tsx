import {
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from '@material-ui/core';
import { getIn } from 'formik';
import React, { useState, useEffect } from 'react';

import { SelectionFromOptionsConfig } from '../../generated/sdk';
import { IBasicComponentProps } from './IBasicComponentProps';

export function ProposalComponentMultipleChoice(props: IBasicComponentProps) {
  const classes = makeStyles({
    horizontalLayout: {
      flexDirection: 'row',
    },
    verticalLayout: {
      flexDirection: 'column',
    },
    wrapper: {
      margin: '18px 0 0 0',
      display: 'inline-flex',
    },
    label: {
      marginTop: '10px',
      marginRight: '5px',
    },
  })();

  const { templateField, touched, errors, onComplete } = props;
  const { proposal_question_id, value } = templateField;
  const [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const config = templateField.config as SelectionFromOptionsConfig;

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  const handleOnChange = (evt: any, newValue: any) => {
    setStateValue(newValue);
    onComplete(evt, newValue);
  };

  switch (config.variant) {
    case 'dropdown':
      return (
        <FormControl fullWidth>
          <TextField
            id={proposal_question_id}
            name={proposal_question_id}
            value={stateValue}
            label={templateField.question}
            select
            onChange={evt =>
              handleOnChange(evt, (evt.target as HTMLInputElement).value)
            }
            SelectProps={{
              MenuProps: {},
            }}
            error={isError}
            helperText={config.small_label}
            margin="normal"
            required={config.required ? true : false}
          >
            {config.options.map(option => {
              return (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              );
            })}
          </TextField>
        </FormControl>
      );

    default:
      return (
        <FormControl
          className={classes.wrapper}
          required={config.required ? true : false}
          error={isError}
        >
          <FormLabel className={classes.label}>
            {templateField.question}
          </FormLabel>
          <span>{templateField.config.small_label}</span>
          <RadioGroup
            id={templateField.proposal_question_id}
            name={templateField.proposal_question_id}
            value={stateValue}
            onChange={evt =>
              handleOnChange(evt, (evt.target as HTMLInputElement).value)
            }
            className={
              config.options!.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {config.options.map(option => {
              return (
                <FormControlLabel
                  value={option}
                  key={option}
                  control={<Radio />}
                  label={option}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      );
  }
}
