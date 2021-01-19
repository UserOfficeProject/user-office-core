import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
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

const useStyles = makeStyles(theme => ({
  horizontalLayout: {
    flexDirection: 'row',
  },
  verticalLayout: {
    flexDirection: 'column',
  },
  radioGroupSpacing: {
    marginBottom: -theme.spacing(1),
  },
}));

export function QuestionaryComponentMultipleChoice(props: BasicComponentProps) {
  const classes = useStyles();

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

  const handleOnChange = (_evt: any, value: string | string[]) => {
    const newValue = toArray(value);
    onComplete(newValue);
  };

  const getCheckbox = (option: string) => {
    if (config.isMultipleSelect) {
      return <Checkbox checked={stateValue.includes(option)} />;
    } else {
      return null;
    }
  };

  const label = (
    <>
      {question}
      {config.small_label && (
        <>
          <br />
          <small>{config.small_label}</small>
        </>
      )}
    </>
  );

  switch (config.variant) {
    case 'dropdown':
      return (
        <FormControl
          fullWidth
          required={config.required}
          error={isError}
          margin="dense"
        >
          <InputLabel id={`questionary-${proposalQuestionId}`}>
            {label}
          </InputLabel>
          <Select
            id={proposalQuestionId}
            value={
              config.isMultipleSelect
                ? stateValue
                : stateValue.length > 0
                ? stateValue[0]
                : ''
            }
            onChange={evt =>
              handleOnChange(evt, (evt.target as HTMLInputElement).value)
            }
            multiple={config.isMultipleSelect}
            labelId={`questionary-${proposalQuestionId}`}
            required={config.required}
            renderValue={item =>
              config.isMultipleSelect
                ? (item as string[]).join(', ')
                : (item as string)
            }
            MenuProps={{
              variant: 'menu',
              getContentAnchorEl: null,
            }}
          >
            {config.options.map(option => {
              return (
                <MenuItem value={option} key={option}>
                  {getCheckbox(option)}
                  {option}
                </MenuItem>
              );
            })}
          </Select>
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );

    default:
      return (
        <FormControl
          required={config.required}
          error={isError}
          margin="dense"
          className={classes.radioGroupSpacing}
        >
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            id={proposalQuestionId}
            name={proposalQuestionId}
            value={stateValue[0] || ''}
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
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );
  }
}
