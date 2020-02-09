import React, { ChangeEvent, useContext, useState } from "react";
import { makeStyles } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { getIn } from "formik";
import TextFieldWithCounter from "./TextFieldWithCounter";
import { TextInputConfig } from "../generated/sdk";
import { ProposalSubmissionContext } from "./ProposalContainer";
import { EventType } from "../models/ProposalSubmissionModel";

export function ProposalComponentTextInput(props: IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();
  let { templateField, touched, errors, handleChange } = props;
  let { proposal_question_id, question, value } = templateField;
  let [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const config = templateField.config as TextInputConfig;
  const { dispatch } = useContext(ProposalSubmissionContext);
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
          handleChange(evt); // letting Formik know that there was a change
          dispatch({
            type: EventType.FIELD_CHANGED,
            payload: {
              id: proposal_question_id,
              newValue: evt.target.value
            }
          });
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
        maxLen={config.max}
      />
    </div>
  );
}
