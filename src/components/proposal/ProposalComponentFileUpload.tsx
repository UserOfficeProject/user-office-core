import { FormControl, FormLabel } from '@material-ui/core';
import React, { ChangeEvent, useState, useEffect } from 'react';

import { FileUploadComponent } from 'components/common/FileUploadComponent';
import { FileUploadConfig } from 'generated/sdk';

import { BasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';

export function ProposalComponentFileUpload(
  props: BasicComponentProps & { files: string[] }
) {
  const { templateField, errors, onComplete } = props;
  const {
    question: { proposalQuestionId },
    value,
  } = templateField;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = templateField.config as FileUploadConfig;
  const [stateValue, setStateValue] = useState(value);

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <FormControl error={isError} required={config.required ? true : false}>
      <FormLabel error={isError}>{templateField.question.question}</FormLabel>
      <span>{config.small_label}</span>
      <FileUploadComponent
        maxFiles={config.max_files}
        id={templateField.question.proposalQuestionId}
        fileType={config.file_type ? config.file_type.join(',') : ''}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          setStateValue(evt.target.value);
          onComplete(evt, evt.target.value); // letting Formik know that there was a change
        }}
        value={stateValue}
      />
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
