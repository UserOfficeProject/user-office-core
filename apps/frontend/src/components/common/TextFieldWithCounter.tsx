import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import React, { ChangeEvent, useState } from 'react';

const TextFieldWithCounter = (
  props: TextFieldProps & {
    maxLen?: number;
    isCounterHidden?: boolean;
  }
) => {
  const [textLen, setTextLen] = useState(
    props.value ? (props.value as string).length : 0
  );
  const handleChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    props.onChange?.(evt);
    setTextLen(evt.target.value.length);
  };

  const { maxLen, isCounterHidden, ...other } = props;

  const counter = isCounterHidden
    ? null
    : `${textLen}`
      ? maxLen
        ? `${textLen}/${maxLen}`
        : `${textLen}`
      : '0';

  return (
    <div>
      <TextField
        {...other}
        onChange={handleChange}
        InputProps={{
          endAdornment: !isCounterHidden && (
            <InputAdornment
              position="end"
              sx={(theme) => ({
                ...(other.multiline && {
                  alignSelf: 'flex-end',
                  alignItems: 'flex-end',
                  marginBottom: -theme.spacing(0.5),
                }),
                ...(maxLen &&
                  textLen > maxLen && { color: theme.palette.error.main }),
              })}
            >
              {counter}
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default TextFieldWithCounter;
