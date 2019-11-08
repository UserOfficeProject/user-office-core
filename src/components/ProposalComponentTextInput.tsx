import React, { ChangeEvent } from "react";
import { TextField, makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { getIn } from "formik";
import "../styles/ProposalComponentStyles.css";

export function ProposalComponentTextInput(props: IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  return (
    <div>
      <TextField
        id={proposal_question_id}
        name={proposal_question_id}
        fullWidth
        label={question}
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
        rows={config.multiline ? 4 : 1}
        rowsMax={config.multiline ? 16 : undefined}
        className={[
          classes.textField,
          templateField.config.required ? "requiredInput" : undefined
        ].join(" ")}
        InputLabelProps={{
          shrink: true
        }}
      />
    </div>
  );
}
