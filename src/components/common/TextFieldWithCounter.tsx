import InputAdornment from '@material-ui/core/InputAdornment';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import clsx from 'clsx';
import React, { ChangeEvent, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  error: {
    color: theme.palette.error.main,
  },
  adornmentPosition: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: -theme.spacing(0.5),
  },
}));

const TextFieldWithCounter = (
  props: TextFieldProps & {
    maxLen?: number;
    isCounterHidden?: boolean;
  }
) => {
  const classes = useStyles();
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
              className={clsx({
                [classes.adornmentPosition]: other.multiline,
                [classes.error]: maxLen && textLen > maxLen,
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
