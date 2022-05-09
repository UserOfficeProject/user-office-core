import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { Field, getIn } from 'formik';
import React, { useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { IntervalConfig, Unit } from 'generated/sdk';
import expressionToFunction from 'utils/expressionToFunction';

const useStyles = makeStyles((theme) => ({
  unitField: {
    paddingRight: theme.spacing(1),
  },
  singleUnit: {
    alignItems: 'flex-end',
    fontSize: '1rem',
    padding: '0px 5px',
  },
}));

type AcceptableUserInput = number | '';

export function QuestionaryComponentInterval(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, question },
  } = answer;
  const config = answer.config as IntervalConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const [stateValue, setStateValue] = useState<{
    min: AcceptableUserInput;
    max: AcceptableUserInput;
    unit: Unit | null; // unit can be null, in case user has specified answer before units were added to the question
    siMin: AcceptableUserInput;
    siMax: AcceptableUserInput;
  }>(answer.value);

  const classes = useStyles();

  const minFieldId = `${id}.min`;
  const maxFieldId = `${id}.max`;
  const unitFieldId = `${id}.unit`;

  const getNumberOrDefault = (
    input: string,
    defaultValue: AcceptableUserInput
  ) => {
    const maybeNumber = parseFloat(input);

    return isNaN(maybeNumber) && input !== '' ? defaultValue : maybeNumber;
  };

  const getUnits = () => {
    if (config.units?.length === 0) {
      return <Field type="hidden" value="" name={unitFieldId} />;
    } else if (config.units?.length === 1) {
      return (
        <FormControl className={`${classes.singleUnit}`} margin="dense">
          {stateValue.unit?.symbol}
        </FormControl>
      );
    } else {
      return (
        <FormControl margin="dense">
          <InputLabel htmlFor={unitFieldId} shrink>
            Unit
          </InputLabel>
          <Select
            id={unitFieldId}
            label="Unit"
            value={stateValue.unit?.id ?? ''}
            onChange={(e) => {
              const newUnitId = e.target.value as string;
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              const unit = config.units?.find((u) => u.id === newUnitId)!;
              const convertToSi = expressionToFunction(
                unit.siConversionFormula
              );
              const newState: typeof stateValue = {
                ...stateValue,
                unit,
                siMin: convertToSi(stateValue.min),
                siMax: convertToSi(stateValue.max),
              };
              setStateValue(newState);
              onComplete(newState);
            }}
            name={unitFieldId}
            data-cy={unitFieldId}
          >
            {config.units?.map(({ id, unit, symbol }) => (
              <MenuItem value={id} key={id}>
                {`${symbol} (${unit})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
  };

  return (
    <FormControl
      error={isError}
      required={config.required}
      margin="dense"
      fullWidth
    >
      <Grid container alignItems="flex-end">
        <Grid item xs={12}>
          <FormLabel>
            <>
              {question}
              {config.small_label && (
                <>
                  <br />
                  <small>{config.small_label}</small>
                </>
              )}
            </>
          </FormLabel>
        </Grid>
        <Grid item xs={3} className={classes.unitField}>
          <TextField
            label="Min"
            id={`${id}-Min`}
            onChange={(event) => {
              const unit = stateValue.unit;
              const newValue = getNumberOrDefault(event.target.value, '');
              const convertToSi = unit
                ? expressionToFunction(unit.siConversionFormula)
                : () => newValue;
              const newStateValue: typeof stateValue = {
                ...stateValue,
                min: newValue,
                siMin: convertToSi(newValue),
              };
              setStateValue(newStateValue);
            }}
            onBlur={() => onComplete(stateValue)}
            value={stateValue.min}
            data-cy={minFieldId}
            type="number"
            name={minFieldId}
            margin="dense"
            fullWidth
            error={isError}
          />
        </Grid>

        <Grid item xs={3} className={classes.unitField}>
          <TextField
            label="Max"
            id={`${id}-Max`}
            onChange={(event) => {
              const unit = stateValue.unit;
              const newValue = getNumberOrDefault(event.target.value, '');
              const convertToSi = unit
                ? expressionToFunction(unit.siConversionFormula)
                : () => newValue;
              const newStateValue: typeof stateValue = {
                ...stateValue,
                max: newValue,
                siMax: convertToSi(newValue),
              };
              setStateValue(newStateValue);
            }}
            onBlur={() => onComplete(stateValue)}
            value={stateValue.max}
            data-cy={maxFieldId}
            type="number"
            name={maxFieldId}
            margin="dense"
            fullWidth
            error={isError}
          />
        </Grid>
        <Grid item xs={6} className={classes.unitField}>
          {getUnits()}
        </Grid>

        <Grid item xs={3}>
          {isError && <FormHelperText>{fieldError.min}</FormHelperText>}
        </Grid>
        <Grid item xs={3}>
          {isError && <FormHelperText>{fieldError.max}</FormHelperText>}
        </Grid>
        <Grid item xs={6}>
          {isError && <FormHelperText>{fieldError.unit}</FormHelperText>}
        </Grid>
      </Grid>
    </FormControl>
  );
}
