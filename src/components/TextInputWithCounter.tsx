import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import React, { ChangeEvent, useState } from "react";
import { makeStyles } from "@material-ui/core";

const TextInputWithCounter = (props: TextFieldProps) => {
  const classes = makeStyles({
    counter: {
      color: "gray",
      position: "absolute",
      bottom: "-15px",
      right: "5px",
      backgroundColor: "rgba(255,255,255,.8)"
    },
    wrapper: {
      position: "relative"
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
      <span className={classes.counter}>{textLen}</span>
    </div>
  );
};

export default TextInputWithCounter;
