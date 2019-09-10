import React, { useState, ChangeEvent } from "react";
import { FormControl, FormLabel, makeStyles, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, Button, LinearProgress, CircularProgress } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import { FileUploadComponent } from "./FileUploadComponent";


export class ProposalCompontentFileUpload extends React.Component<IBasicComponentProps, {files: string[];}> {
    getUniqueFileId() {
    return `${this.props.templateField.proposal_question_id}_${new Date().getTime()}`;
  }

  render() {
    let { templateField, touched, errors } = this.props;
    let { proposal_question_id, config } = templateField;
    let isError = touched[proposal_question_id] && errors[proposal_question_id]? true: false;
    
    return (
    <FormControl error={isError}>
      <FormLabel error={isError}>{templateField.question}</FormLabel>
      <span>{templateField.config.small_label}</span>
        <FileUploadComponent maxFiles={config.maxFiles} id={templateField.proposal_question_id}/>
      <span>{config.small_label}</span>
      {isError && <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>}
    </FormControl>
    );
  }
}


