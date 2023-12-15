import {
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { getIn } from 'formik';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { InstrumentPickerConfig } from 'generated/sdk';

const useStyles = makeStyles(() => ({
  horizontalLayout: {
    flexDirection: 'row',
  },
  verticalLayout: {
    flexDirection: 'column',
  },
}));

export function QuestionaryComponentInstrumentPicker(
  props: BasicComponentProps
) {
  const classes = useStyles();
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, question, naturalKey },
  } = answer;
  const config = answer.config as InstrumentPickerConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;

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

  const handleOnChange = (event: SelectChangeEvent<string | string[]>) => {
    onComplete(+event.target.value || '');
  };
  switch (config.variant) {
    case 'dropdown':
      return (
        <FormControl
          fullWidth
          required={config.required}
          error={isError}
          margin="dense"
        >
          <InputLabel id={`questionary-${id}`}>{label}</InputLabel>
          <Select
            id={id}
            value={answer.value ?? ''}
            onChange={handleOnChange}
            labelId={`questionary-${id}`}
            required={config.required}
            MenuProps={{
              variant: 'menu',
            }}
            data-natural-key={naturalKey}
            data-cy="dropdown-ul"
          >
            <MenuItem value={''}>None</MenuItem>
            {config.instruments.map((instrument) => {
              return (
                <MenuItem value={instrument.id} key={instrument.id}>
                  {instrument.name}
                </MenuItem>
              );
            })}
          </Select>
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );
    default:
      return (
        <FormControl required={config.required} error={isError} margin="dense">
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            id={id}
            name={id}
            value={answer.value ?? null}
            onChange={handleOnChange}
            className={
              config.instruments.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
            data-cy="radio-ul"
          >
            {config.instruments.map((instrument) => {
              return (
                <FormControlLabel
                  value={instrument.id}
                  key={instrument.id}
                  control={<Radio />}
                  label={instrument.name}
                />
              );
            })}
          </RadioGroup>
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );
  }
}
