import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import React, { ChangeEvent, useState } from "react";
import { makeStyles } from "@material-ui/core";

const TextFieldWithCounter = (props: TextFieldProps) => {
  const classes = makeStyles({
    counter: {
      color: "gray"
    },
    wrapper: {
      textAlign: "right"
    }
  })();
  var [textLen, setTextLen] = useState(0);
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(evt);
    setTextLen(evt.target.value.length);
  };
  return (
    <div className={classes.wrapper}>
      <TextField {...props} onChange={handleChange} />
      <span className={classes.counter}>{textLen || ""}</span>
    </div>
  );
};

export default TextFieldWithCounter;
