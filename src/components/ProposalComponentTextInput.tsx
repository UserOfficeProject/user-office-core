import React, { ChangeEvent } from "react";
import { TextField, makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
export function ProposalComponentTextInput(props: IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;
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
        placeholder={config.small_label}
        error={isError}
        helperText={errors[proposal_question_id]}
        multiline={config.multiline}
        rows={config.multiline ? 4 : 1}
        rowsMax={config.multiline ? 16 : undefined}
        className={classes.textField}
        InputLabelProps={{
          shrink: true
        }}
      />
    </div>
  );
}
