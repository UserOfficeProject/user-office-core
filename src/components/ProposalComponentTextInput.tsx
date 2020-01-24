import React, { ChangeEvent } from "react";
import { makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { getIn } from "formik";
import TextFieldWithCounter from "./TextFieldWithCounter";
import { TextInputConfig } from "../generated/sdk";

export function ProposalComponentTextInput(props: IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, question } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const config = templateField.config as TextInputConfig;
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
        value={templateField.value}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          templateField.value = evt.target.value;
          handleChange(evt); // letting Formik know that there was a change
        }}
        onBlur={() => onComplete()}
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
        maxLen={config.max}
      />
    </div>
  );
}
