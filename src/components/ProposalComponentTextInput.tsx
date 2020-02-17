import { makeStyles } from "@material-ui/core";
import { getIn } from "formik";
import React, { ChangeEvent, useState, useEffect } from "react";
import { TextInputConfig } from "../generated/sdk";
import { IBasicComponentProps } from "./IBasicComponentProps";
import TextFieldWithCounter from "./TextFieldWithCounter";

export function ProposalComponentTextInput(props: IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();
  let { templateField, touched, errors, onComplete } = props;
  let { proposal_question_id, question, value } = templateField;
  let [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const config = templateField.config as TextInputConfig;

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <div>
      {config.htmlQuestion && (
        <div
          dangerouslySetInnerHTML={{
            __html: config.htmlQuestion!
          }}
        ></div>
      )}
      <TextFieldWithCounter
        variant="standard"
        id={proposal_question_id}
        name={proposal_question_id}
        fullWidth
        required={config.required ? true : false}
        label={config.htmlQuestion ? "" : question}
        value={stateValue}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          setStateValue(evt.target.value);
        }}
        onBlur={evt => {
          onComplete(evt, evt.target.value);
        }}
        placeholder={config.placeholder}
        error={isError}
        helperText={isError && errors[proposal_question_id]}
        multiline={config.multiline}
        rows={config.multiline ? 2 : 1}
        rowsMax={config.multiline ? 16 : undefined}
        className={classes.textField}
        InputLabelProps={{
          shrink: true
        }}
        maxLen={config.max || undefined}
      />
    </div>
  );
}
