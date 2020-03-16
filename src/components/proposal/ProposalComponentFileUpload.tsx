import { FormControl, FormLabel } from '@material-ui/core';
import React, { ChangeEvent, useState, useEffect } from 'react';

import { FileUploadConfig } from '../../generated/sdk';
import { FileUploadComponent } from '../common/FileUploadComponent';
import { IBasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';

export function ProposalComponentFileUpload(
  props: IBasicComponentProps & { files: string[] }
) {
  const { templateField, errors, onComplete } = props;
  const { proposal_question_id, value } = templateField;
  const isError = errors[proposal_question_id] ? true : false;
  const config = templateField.config as FileUploadConfig;
  const [stateValue, setStateValue] = useState(value);

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <FormControl error={isError} required={config.required ? true : false}>
      <FormLabel error={isError}>{templateField.question}</FormLabel>
      <span>{templateField.config.small_label}</span>
      <FileUploadComponent
        maxFiles={config.max_files}
        id={templateField.proposal_question_id}
        fileType={config.file_type ? config.file_type.join(',') : ''}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          setStateValue(evt.target.value);
          onComplete(evt, evt.target.value); // letting Formik know that there was a change
        }}
        value={stateValue}
      />
      {isError && (
        <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
