import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import React, { ChangeEvent, useState } from "react";
import { makeStyles } from "@material-ui/core";

const TextFieldWithCounter = (props: TextFieldProps & { maxLen?: number }) => {
  const classes = makeStyles(theme => ({
    counter: {
      color: "gray",
      display: "inline-block"
    },
    wrapper: {
      textAlign: "right"
    },
    error: {
      color: `${theme.palette.error.main}!important`
    }
  }))();
  var [textLen, setTextLen] = useState(
    props.value ? String(props.value).length : 0
  );
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    props.onChange && props.onChange(evt);
    setTextLen(evt.target.value.length);
  };

  const getCounterClassNames = () => {
    var classNames = [classes.counter];
    if (maxLen && textLen > maxLen) {
      classNames.push(classes.error);
    }
    return classNames.join(" ");
  };

  const { maxLen, ...other } = props;
  return (
    <div className={classes.wrapper}>
      <TextField {...other} onChange={handleChange} />
      <span className={getCounterClassNames()}>
        {textLen ? `${textLen}/${maxLen}` : ""}
      </span>
    </div>
  );
};

export default TextFieldWithCounter;
