import {
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
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
interface InstrumentIdAndTime {
  instrumentId: string;
  timeRequested?: string;
}
interface InstrumentIdNameAndTime {
  instrumentId: string;
  instrumentName?: string;
  timeRequested: string;
}
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
    value,
  } = answer;
  const [stateValue, setStateValue] =
    useState<Array<InstrumentIdAndTime>>(value);
  const config = answer.config as InstrumentPickerConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const valueWithInstrumentName = value.map((v: InstrumentIdAndTime) => {
    return {
      instrumentId: v.instrumentId,
      instrumentName: config.instruments.find(
        (i) => i.id.toString() === v.instrumentId
      )?.name,
      timeRequested: v.timeRequested,
    };
  });
  const [requestTimeForInstrument, setRequestTimeForInstrument] = useState<
    Array<InstrumentIdNameAndTime>
  >(valueWithInstrumentName);
  useEffect(() => {
    setStateValue(answer.value);
    const valueWithInstrumentName = answer.value.map(
      (v: InstrumentIdAndTime) => {
        return {
          instrumentId: v.instrumentId,
          instrumentName: config.instruments.find(
            (i) => i.id.toString() === v.instrumentId
          )?.name,
          timeRequested: v.timeRequested,
        };
      }
    );
    setRequestTimeForInstrument(valueWithInstrumentName);
  }, [answer, config.instruments.length]);

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
    const newValue = event.target.value;
    let newInstrumentTime: InstrumentIdAndTime[] = [];
    if (Array.isArray(newValue) && newValue.length > 0) {
      newInstrumentTime = newValue.map((id) => {
        return {
          instrumentId: id,
          timeRequested: requestTimeForInstrument.filter(
            (value) => value.instrumentId === id
          )
            ? requestTimeForInstrument.find(
                (value) => value.instrumentId === id
              )?.timeRequested
            : '0',
        };
      });
    } else if (typeof newValue === 'number') {
      newInstrumentTime = [{ instrumentId: id, timeRequested: '0' }];
    }
    onComplete(newInstrumentTime);
  };

  const handleTimeInput = (time: string, id: string) => {
    let newInstrumentTime: InstrumentIdAndTime[] = [];
    newInstrumentTime = requestTimeForInstrument.map((obj) => {
      if (obj.instrumentId === id) {
        return { ...obj, timeRequested: time };
      } else {
        return obj;
      }
    });
    onComplete(newInstrumentTime);
  };
  const DynamicTimeFields = () => {
    return requestTimeForInstrument && requestTimeForInstrument.length > 0 ? (
      <Stack direction="row" spacing={3} marginTop={3}>
        {requestTimeForInstrument.map((value) => {
          if (value.instrumentId)
            return (
              <TextField
                key={value.instrumentId}
                value={value.timeRequested}
                label={`Request Time`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {value.instrumentName}:
                    </InputAdornment>
                  ),
                }}
                data-time-request={value.instrumentId + '-time-request'}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  handleTimeInput(e.target.value, value.instrumentId);
                }}
              />
            );
        })}
      </Stack>
    ) : null;
  };
  const SelectMenuItem = config.isMultipleSelect ? MultiMenuItem : MenuItem;

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
            value={
              stateValue?.filter((i) => i).map((i) => i.instrumentId) || []
            }
            onChange={handleOnChange}
            multiple={config.isMultipleSelect}
            labelId={`questionary-${id}`}
            required={config.required}
            MenuProps={{
              variant: 'menu',
            }}
            data-natural-key={naturalKey}
            data-cy="dropdown-ul"
          >
            {!config.isMultipleSelect && <MenuItem value={0}>None</MenuItem>}
            {config.instruments.map((instrument) => {
              return (
                <SelectMenuItem
                  value={instrument.id.toString()}
                  key={instrument.id}
                >
                  {instrument.name}
                </SelectMenuItem>
              );
            })}
          </Select>
          {config.requestTime && <DynamicTimeFields />}
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
