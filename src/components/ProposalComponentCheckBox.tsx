import React, { ChangeEvent } from "react";
import { FormControl, FormControlLabel, Checkbox } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";

export function ProposalComponentCheckBox(props: IBasicComponentProps) {

  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;

  return (
    <FormControl error={isError}>
      <FormControlLabel
        control={
          <Checkbox
            id={proposal_question_id}
            name={proposal_question_id}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              templateField.value = evt.target.checked;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
          />
        }
        label={question}
      />

      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
