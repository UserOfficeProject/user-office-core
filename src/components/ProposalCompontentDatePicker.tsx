import React from "react";
import { FormControl } from "@material-ui/core";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
export function ProposalCompontentDatePicker(props: IBasicComponentProps) {
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;
  if (!templateField.value) {
    templateField.value = new Date();
  }
  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          error={isError}
          disableToolbar
          variant="inline"
          format="dd/MMM/yyyy"
          id={proposal_question_id}
          name={proposal_question_id}
          label={question}
          value={templateField.value}
          onChange={(date, val) => {
            templateField.value = val;
            handleChange(val); // letting Formik know that there was a change;
            onComplete();
          }}
          KeyboardButtonProps={{
            "aria-label": "change date"
          }}
        />
      </MuiPickersUtilsProvider>
      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
