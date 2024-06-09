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
  timeRequested?: string;
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
  const [stateValue, setStateValue] = useState<
    Array<InstrumentIdAndTime> | InstrumentIdAndTime
  >(value);
  const config = answer.config as InstrumentPickerConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const valueWithInstrumentName = Array.isArray(value)
    ? value.map((v: InstrumentIdAndTime) => {
        return {
          instrumentId: v.instrumentId,
          instrumentName: config.instruments.find(
            (i) => i.id.toString() === v.instrumentId
          )?.name,
          timeRequested: v.timeRequested,
        };
      })
    : {
        instrumentId: value?.instrumentId as string,
        instrumentName: config.instruments.find(
          (i) => i.id.toString() === value?.instrumentId
        )?.name,
        timeRequested: value?.timeRequested as string,
      };
  const [requestTimeForInstrument, setRequestTimeForInstrument] = useState<
    Array<InstrumentIdNameAndTime> | InstrumentIdNameAndTime
  >(valueWithInstrumentName);
  useEffect(() => {
    setStateValue(answer.value);
    const valueWithInstrumentName = Array.isArray(value)
      ? value.map((v: InstrumentIdAndTime) => {
          return {
            instrumentId: v.instrumentId,
            instrumentName: config.instruments.find(
              (i) => i.id.toString() === v.instrumentId
            )?.name,
            timeRequested: v.timeRequested,
          };
        })
      : {
          instrumentId: value?.instrumentId as string,
          instrumentName: config.instruments.find(
            (i) => i.id.toString() === value?.instrumentId
          )?.name,
          timeRequested: value?.timeRequested as string,
        };
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
    let newInstrumentTime: InstrumentIdAndTime[] | InstrumentIdAndTime =
      [] || {};
    if (
      Array.isArray(newValue) &&
      newValue.length > 0 &&
      Array.isArray(requestTimeForInstrument)
    ) {
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
    } else if (typeof newValue === 'string') {
      newInstrumentTime = {
        instrumentId: newValue,
        timeRequested: '0',
      };
    }
    onComplete(newInstrumentTime);
  };

  const handleTimeInput = (time: string, id: string) => {
    let newInstrumentTime: InstrumentIdAndTime[] | InstrumentIdAndTime =
      [] || {};
    newInstrumentTime = Array.isArray(requestTimeForInstrument)
      ? requestTimeForInstrument.map((obj) => {
          if (obj.instrumentId === id) {
            return { instrumentId: obj.instrumentId, timeRequested: time };
          } else {
            return {
              instrumentId: obj.instrumentId,
              timeRequested: obj.timeRequested,
            };
          }
        })
      : { instrumentId: id, timeRequested: time };
    onComplete(newInstrumentTime);
  };
  const DynamicTimeFields = () => {
    return requestTimeForInstrument &&
      Array.isArray(requestTimeForInstrument) ? (
      <Stack direction="row" spacing={3} marginTop={3}>
        {requestTimeForInstrument.map((value) => {
          if (value.instrumentId)
            return (
              <TextField
                key={value.instrumentId}
                value={value.timeRequested === '0' ? '' : value.timeRequested}
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
    ) : (
      <Stack direction="row" spacing={3} marginTop={3}>
        <TextField
          key={requestTimeForInstrument.instrumentId}
          value={
            requestTimeForInstrument.timeRequested === '0'
              ? ''
              : requestTimeForInstrument.timeRequested
          }
          label={`Request Time`}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {requestTimeForInstrument.instrumentName}:
              </InputAdornment>
            ),
          }}
          data-time-request={
            requestTimeForInstrument.instrumentId + '-time-request'
          }
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleTimeInput(
              e.target.value,
              requestTimeForInstrument.instrumentId
            );
          }}
        />
      </Stack>
    );
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
              Array.isArray(stateValue)
                ? stateValue?.filter((i) => i).map((i) => i.instrumentId) || []
                : stateValue?.instrumentId || '0'
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
