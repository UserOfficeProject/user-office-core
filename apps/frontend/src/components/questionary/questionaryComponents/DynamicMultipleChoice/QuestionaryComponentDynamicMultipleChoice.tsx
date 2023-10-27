import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DynamicMultipleChoiceConfig } from 'generated/sdk';
import { useGetDynamicMultipleChoiceOptions } from 'hooks/template/useGetDynamicMultipleChoiceOptions';

const toArray = (input: string | string[]): string[] => {
  if (typeof input === 'string') {
    return [input];
  }

  return input;
};

const useStyles = makeStyles(() => ({
  horizontalLayout: {
    flexDirection: 'row',
  },
  verticalLayout: {
    flexDirection: 'column',
  },
}));

export function QuestionaryComponentDynamicMultipleChoice(
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

  const config = answer.config as DynamicMultipleChoiceConfig;

  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;

  const { options, loadingOptions } = useGetDynamicMultipleChoiceOptions(id);
  const [stateValue, setStateValue] = useState<Array<string>>([]);

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  const handleOnChange = (event: SelectChangeEvent<string | string[]>) => {
    const newValue = toArray(event.target.value);

    onComplete(newValue);
  };

  const hasNoContent = 'No available answer found';

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

  const SelectMenuItem = config.isMultipleSelect ? MultiMenuItem : MenuItem;

  const helperTexts = (
    <>
      {options.length < 1 && !loadingOptions && (
        <FormHelperText>{hasNoContent}</FormHelperText>
      )}
      {loadingOptions && <UOLoader size={14} />}
      {isError && <FormHelperText>{fieldError}</FormHelperText>}
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
          <InputLabel id={`questionary-${id}`}>{label}</InputLabel>
          <Select
            id={id}
            data-cy="dropdown-ul"
            value={
              config.isMultipleSelect
                ? stateValue
                : stateValue.length > 0
                ? stateValue[0]
                : ''
            }
            onChange={handleOnChange}
            multiple={config.isMultipleSelect}
            labelId={`questionary-${id}`}
            required={config.required}
            renderValue={(item) =>
              config.isMultipleSelect
                ? (item as string[]).join(', ')
                : (item as string)
            }
            MenuProps={{
              variant: 'menu',
            }}
            data-natural-key={naturalKey}
          >
            {options.map((option) => {
              return (
                <SelectMenuItem
                  value={option}
                  key={option}
                  data-cy="dropdown-li"
                >
                  {option}
                </SelectMenuItem>
              );
            })}
          </Select>
          {helperTexts}
        </FormControl>
      );

    default:
      return (
        <FormControl required={config.required} error={isError} margin="dense">
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            id={id}
            name={id}
            value={stateValue[0] || ''}
            onChange={handleOnChange}
            className={
              options.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {options.map((option) => {
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
          {helperTexts}
        </FormControl>
      );
  }
}
