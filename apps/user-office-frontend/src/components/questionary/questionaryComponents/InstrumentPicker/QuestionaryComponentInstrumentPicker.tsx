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
import React, { useContext } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import { Call, SelectionFromOptionsConfig } from 'generated/sdk';

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
  const { state } = useContext(QuestionaryContext) as ProposalContextType;
  const call = state?.proposal?.call as Call;
  const classes = useStyles();
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, question, naturalKey },
  } = answer;
  const config = answer.config as SelectionFromOptionsConfig;
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
    onComplete(event.target.value);
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
            value={answer.value ?? null}
            onChange={handleOnChange}
            multiple={config.isMultipleSelect}
            labelId={`questionary-${id}`}
            required={config.required}
            MenuProps={{
              variant: 'menu',
            }}
            data-natural-key={naturalKey}
          >
            <MenuItem value={''}>None</MenuItem>
            {call.instruments.map((instrument) => {
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
            value={answer.value ?? ''}
            onChange={handleOnChange}
            className={
              call.instruments.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {call.instruments.map((instrument) => {
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
