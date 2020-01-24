import React, { ChangeEvent } from "react";
import { FormControl, FormLabel } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import { FileUploadComponent } from "./FileUploadComponent";
import { FileUploadConfig } from "../generated/sdk";

export class ProposalCompontentFileUpload extends React.Component<
  IBasicComponentProps,
  { files: string[] }
> {
  render() {
    const { templateField, errors, onComplete, handleChange } = this.props;
    const { proposal_question_id } = templateField;
    const isError = errors[proposal_question_id] ? true : false;
    const config = templateField.config as FileUploadConfig;
    return (
      <FormControl error={isError} required={config.required ? true : false}>
        <FormLabel error={isError}>{templateField.question}</FormLabel>
        <span>{templateField.config.small_label}</span>
        <FileUploadComponent
          maxFiles={config.max_files}
          id={templateField.proposal_question_id}
          fileType={config.file_type ? config.file_type.join(",") : ""}
          onChange={(evt: ChangeEvent<HTMLInputElement>) => {
            templateField.value = evt.target.value;
            handleChange(evt); // letting Formik know that there was a change
            onComplete();
          }}
          value={templateField.value}
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
