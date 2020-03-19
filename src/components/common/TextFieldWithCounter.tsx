import { makeStyles } from '@material-ui/core';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import React, { ChangeEvent, useState } from 'react';

const TextFieldWithCounter = (props: TextFieldProps & { maxLen?: number }) => {
  const classes = makeStyles(theme => ({
    counter: {
      color: 'gray',
      display: 'inline-block',
    },
    wrapper: {
      textAlign: 'right',
    },
    error: {
      color: `${theme.palette.error.main}!important`,
    },
  }))();
  const [textLen, setTextLen] = useState(
    props.value ? String(props.value).length : 0
  );
  const handleChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    props.onChange && props.onChange(evt);
    setTextLen(evt.target.value.length);
  };

  const { maxLen, ...other } = props;

  const getCounterClassNames = (): string => {
    const classNames = [classes.counter];
    if (maxLen && textLen > maxLen) {
      classNames.push(classes.error);
    }

    return classNames.join(' ');
  };

  return (
    <div className={classes.wrapper}>
      <TextField {...other} onChange={handleChange} />
      <span className={getCounterClassNames()}>
        {textLen ? (maxLen ? `${textLen}/${maxLen}` : textLen) : ''}
      </span>
    </div>
  );
};

export default TextFieldWithCounter;
