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
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { TechniquePickerConfig } from 'generated/sdk';
import { toArray } from 'utils/helperFunctions';

export function QuestionaryComponentTechniquePicker(
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
  const [stateValue, setStateValue] = useState<Array<string> | string>(value);
  const config = answer.config as TechniquePickerConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

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
    const newValue = event.target.value || null;
    let techniques: number[] | number = [] || {};
    if (Array.isArray(newValue) && newValue.length > 0) {
      techniques = newValue.map((id) => {
        return +id;
      });
    } else if (typeof newValue === 'string') {
      techniques = +newValue;
    }

    onComplete(techniques);
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
              config.isMultipleSelect ? toArray(stateValue) : stateValue || '0'
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
            {config.techniques.map((technique) => {
              return (
                <SelectMenuItem value={technique.id} key={technique.id}>
                  {technique.name}
                </SelectMenuItem>
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
            sx={{
              flexDirection: config.techniques.length < 3 ? 'row' : 'column',
            }}
            data-cy="radio-ul"
          >
            {config.techniques.map((technique) => {
              return (
                <FormControlLabel
                  value={technique.id}
                  key={technique.id}
                  control={<Radio />}
                  label={technique.name}
                />
              );
            })}
          </RadioGroup>
          {isError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>
      );
  }
}
