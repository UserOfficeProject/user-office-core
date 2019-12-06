import React, { ChangeEvent } from "react";
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  makeStyles
} from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import { getIn } from "formik";

export function ProposalComponentBoolean(props: IBasicComponentProps) {
  let { templateField, onComplete, errors, handleChange, touched } = props;
  let { proposal_question_id, config, question } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;

  const classes = makeStyles({
    label: {
      marginRight: "5px"
    }
  })();

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
            checked={templateField.value || false}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
            required={config.required ? true : false}
          />
        }
        label={question}
        className={classes.label}
      />
      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
