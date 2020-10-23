import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useState, useEffect } from 'react';

import { FileMetaData } from 'models/FileUpload';

import { FileUploadConfig } from '../../../generated/sdk';
import { FileUploadComponent } from '../../common/FileUploadComponent';
import { BasicComponentProps } from '../../proposal/IBasicComponentProps';
import ProposalErrorLabel from '../../proposal/ProposalErrorLabel';

export function QuestionaryComponentFileUpload(
  props: BasicComponentProps & { files?: string[] }
) {
  const { templateField, errors, onComplete } = props;
  const {
    question: { proposalQuestionId },
    value,
  } = templateField;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = templateField.config as FileUploadConfig;
  const [stateValue, setStateValue] = useState<string[]>(value);

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
        onChange={(fileMetaDataList: FileMetaData[]) => {
          const newStateValue = fileMetaDataList.map(file => file.fileId);
          setStateValue(newStateValue);
          onComplete(null as any, newStateValue); // letting Formik know that there was a change
        }}
        value={stateValue}
      />
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
