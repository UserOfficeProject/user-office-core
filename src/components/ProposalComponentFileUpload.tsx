import React, { ChangeEvent, useContext, useState } from "react";
import { FormControl, FormLabel } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import { FileUploadComponent } from "./FileUploadComponent";
import { FileUploadConfig } from "../generated/sdk";
import { ProposalSubmissionContext } from "./ProposalContainer";
import { EventType } from "../models/ProposalSubmissionModel";

export class ProposalComponentFileUpload extends React.Component<
  IBasicComponentProps,
  { files: string[] }
> {
  render() {
    const { templateField, errors, handleChange } = this.props;
    const { proposal_question_id, value } = templateField;
    let [stateValue, setStateValue] = useState(value);
    const isError = errors[proposal_question_id] ? true : false;
    const config = templateField.config as FileUploadConfig;
    const { dispatch } = useContext(ProposalSubmissionContext);
    return (
      <FormControl error={isError} required={config.required ? true : false}>
        <FormLabel error={isError}>{templateField.question}</FormLabel>
        <span>{templateField.config.small_label}</span>
        <FileUploadComponent
          maxFiles={config.max_files}
          id={templateField.proposal_question_id}
          fileType={config.file_type ? config.file_type.join(",") : ""}
          onChange={(evt: ChangeEvent<HTMLInputElement>) => {
            setStateValue(evt.target.value);
            handleChange(evt); // letting Formik know that there was a change
            dispatch({
              type: EventType.FIELD_CHANGED,
              payload: {
                id: proposal_question_id,
                newValue: evt.target.value
              }
            });
          }}
          value={stateValue}
        />
        {isError && (
          <ProposalErrorLabel>
            {errors[proposal_question_id]}
          </ProposalErrorLabel>
        )}
      </FormControl>
    );
  }
}
