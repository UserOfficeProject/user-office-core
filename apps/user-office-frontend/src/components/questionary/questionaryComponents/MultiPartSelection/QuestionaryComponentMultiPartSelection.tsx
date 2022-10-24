import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { SelectChangeEvent } from '@mui/material/Select';
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { MultiPartSelectionConfig } from '../../../../generated/sdk';
import { BasicComponentProps } from '../../../proposal/IBasicComponentProps';

export function QuestionaryComponentMultiPartSelection(
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

  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const config = answer.config as MultiPartSelectionConfig;

  const [firstPartAnswer, setFirstPartAnswer] = useState<string>(
    answer.value.partOneAnswer
  );
  const [secondPartAnswer, setSecondPartAnswer] = useState<string>(
    answer.value.partTwoAnswer
  );
  const [secondPartValues, setSecondPartValues] = useState<string[]>([]);

  useEffect(() => {
    setFirstPartAnswer(answer.value.partOneAnswer);
    setSecondPartAnswer(answer.value.partTwoAnswer);
  }, [answer]);

  const handleFirstPartChange = (event: SelectChangeEvent) => {
    setFirstPartAnswer(event.target.value);
    setSecondPartValues(
      config.selectionPairs.filter((pair) => pair.key === event.target.value)[0]
        .value
    );
  };

  const handleSecondPartChange = (event: SelectChangeEvent) => {
    const newPartTwoAnswer = event.target.value;
    setSecondPartAnswer(newPartTwoAnswer);
    onComplete({
      partOneAnswer: firstPartAnswer,
      partTwoAnswer: newPartTwoAnswer,
    });
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

  return (
    <div>
      <FormControl
        fullWidth
        required={config.required}
        error={isError}
        margin={'dense'}
      >
        <InputLabel id={`questionary-${id}`}>
          {config.partOneQuestion}
        </InputLabel>
        <Select
          id={`${id}-part-1`}
          value={firstPartAnswer ? firstPartAnswer : ''} // check
          onChange={handleFirstPartChange}
          labelId={`questionary-p1-${id}`}
          MenuProps={{
            variant: 'menu',
          }}
          data-natural-key={naturalKey}
        >
          {config.selectionPairs.map((option, index) => {
            return (
              <MenuItem value={option.key} key={index}>
                {option.key}
              </MenuItem>
            );
          })}
        </Select>

        {isError && <FormHelperText>{fieldError}</FormHelperText>}
      </FormControl>
      <FormControl
        required={config.required}
        error={isError}
        margin={'dense'}
        fullWidth
      >
        <InputLabel>{config.partTwoQuestion}</InputLabel>
        <Select
          id={`${id}-part-2`}
          value={secondPartAnswer ? secondPartAnswer : ''}
          MenuProps={{ variant: 'menu' }}
          onChange={handleSecondPartChange}
          data-natural-key={naturalKey}
        >
          {secondPartValues.map((v, index) => {
            return (
              <MenuItem value={v} key={v}>
                {v}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
}
