import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { SelectionFromOptionsConfig } from 'generated/sdk';

const toArray = (input: string | string[]): string[] => {
  if (typeof input === 'string') {
    return [input];
  }

  return input;
};

export function QuestionaryComponentMultipleChoice(props: BasicComponentProps) {
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

  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { proposalQuestionId, question },
    value,
  } = answer;
  const [stateValue, setStateValue] = useState<Array<string>>(value);
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const config = answer.config as SelectionFromOptionsConfig;

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  const handleOnChange = (evt: any, value: string | string[]) => {
    const newValue = toArray(value);
    setStateValue(newValue);
    onComplete(evt, newValue);
  };

  switch (config.variant) {
    case 'dropdown':
      return (
        <FormControl fullWidth>
          <TextField
            id={proposalQuestionId}
            name={proposalQuestionId}
            value={config.isMultipleSelect ? stateValue : stateValue[0]}
            label={question}
            select
            onChange={evt =>
              handleOnChange(evt, (evt.target as HTMLInputElement).value)
            }
            SelectProps={{
              multiple: config.isMultipleSelect,
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
          <FormLabel className={classes.label}>{question}</FormLabel>
          <span>{config.small_label}</span>
          <RadioGroup
            id={proposalQuestionId}
            name={proposalQuestionId}
            value={stateValue[0]}
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
