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
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { Answer, InstrumentPickerConfig } from 'generated/sdk';

/* InstrumentIdAndTime is used to save the 
instrument id and requested time in database*/
interface InstrumentIdAndTime {
  instrumentId: string;
  timeRequested?: string;
}
/* InstrumentIdNameAndTime is used to display the 
instrument id, name and requested time in frontend*/
interface InstrumentIdNameAndTime {
  instrumentId: string;
  instrumentName?: string;
  timeRequested?: string;
}
export function processInstrumentPickerValue(
  answer: Answer,
  config: InstrumentPickerConfig
) {
  if (Array.isArray(answer.value)) {
    return answer.value.filter((answer) =>
      answer?.instrumentId
        ? config.instruments.some(
            (instrument) => instrument.id.toString() === answer.instrumentId
          )
        : false
    );
  } else if (config?.instruments && answer.value?.instrumentId) {
    const instrumentExists = config.instruments.some(
      (instrument) => instrument.id.toString() === answer.value.instrumentId
    );

    return instrumentExists ? answer.value : null;
  }

  return undefined;
}
export function QuestionaryComponentInstrumentPicker(
  props: BasicComponentProps
) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, question, naturalKey },
    value,
  } = answer;

  const config = answer.config as InstrumentPickerConfig;
  const [stateValue, setStateValue] = useState<
    Array<InstrumentIdAndTime> | InstrumentIdAndTime
  >(() => processInstrumentPickerValue(answer, config));
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const getValueWithInstrumentName = () => {
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

    return valueWithInstrumentName;
  };
  const [requestTimeForInstrument, setRequestTimeForInstrument] = useState<
    Array<InstrumentIdNameAndTime> | InstrumentIdNameAndTime
  >(getValueWithInstrumentName());
  useEffect(() => {
    setStateValue((prevState) => {
      const processedValue = processInstrumentPickerValue(answer, config);

      return processedValue !== undefined ? processedValue : prevState;
    });

    setRequestTimeForInstrument(getValueWithInstrumentName());
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
    if (
      Array.isArray(newValue) &&
      newValue.length > 0 &&
      Array.isArray(requestTimeForInstrument)
    ) {
      onComplete(
        newValue.map((id) => {
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
        })
      );

      return;
    } else if (typeof newValue === 'string') {
      onComplete({
        instrumentId: newValue,
        timeRequested: '0',
      });

      return;
    }
    onComplete([]);
  };

  const handleTimeInput = (time: string, id: string) => {
    onComplete(
      Array.isArray(requestTimeForInstrument)
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
        : { instrumentId: id, timeRequested: time }
    );
  };
  const DynamicTimeFields = () => {
    const requestTime = Array.isArray(requestTimeForInstrument)
      ? requestTimeForInstrument
      : [requestTimeForInstrument];

    return (
      requestTimeForInstrument && (
        <Stack direction="row" spacing={3} marginTop={3}>
          {requestTime.map((value: InstrumentIdNameAndTime) => {
            if (value.instrumentId)
              return (
                <TextField
                  key={value.instrumentId}
                  value={value.timeRequested === '0' ? '' : value.timeRequested}
                  required={config.required}
                  error={isError}
                  label={`Request Time`}
                  type="number"
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
      )
    );
  };

  const DisplayErrorMessage = () => {
    let errormessage: string;
    if (config.requestTime) {
      errormessage = Array.isArray(fieldError)
        ? fieldError
            .map(
              (e: { instrumendId: string; timeRequested: string }) =>
                e.timeRequested
            )
            .join(' ')
        : fieldError.timeRequested === undefined
          ? fieldError
          : fieldError.timeRequested;
    } else {
      errormessage = Array.isArray(fieldError)
        ? fieldError[0].instumentId
        : fieldError;
    }

    return isError && <FormHelperText>{errormessage}</FormHelperText>;
  };

  const SelectMenuItem = config.isMultipleSelect ? MultiMenuItem : MenuItem;
  const instrumentSort = [...config.instruments];
  const data = instrumentSort.sort((a, b) => (a.name > b.name ? 1 : -1));
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
                : stateValue?.instrumentId
                  ? [stateValue.instrumentId]
                  : []
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
            {data.map((data) => {
              return (
                <SelectMenuItem value={data.id.toString()} key={data.id}>
                  {data.name}
                </SelectMenuItem>
              );
            })}
          </Select>
          {config.requestTime && requestTimeForInstrument && (
            <DynamicTimeFields />
          )}
          {isError && <DisplayErrorMessage />}
        </FormControl>
      );
    default:
      return (
        <FormControl required={config.required} error={isError} margin="dense">
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            id={id}
            name={id}
            value={answer.value?.instrumentId ?? null}
            onChange={handleOnChange}
            sx={{
              flexDirection: config.instruments.length < 3 ? 'row' : 'column',
            }}
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
          {config.requestTime && requestTimeForInstrument && (
            <DynamicTimeFields />
          )}
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );
  }
}
