import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useEffect, useState } from 'react';

import { FileUploadComponent } from 'components/common/FileUploadComponent';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import { FileUploadConfig } from 'generated/sdk';
import { FileMetaData } from 'models/FileUpload';

export function QuestionaryComponentFileUpload(
  props: BasicComponentProps & { files?: string[] }
) {
  const {
    answer,
    onComplete,
    formikProps: { errors },
  } = props;
  const {
    question: { proposalQuestionId },
    value,
  } = answer;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = answer.config as FileUploadConfig;
  const [stateValue, setStateValue] = useState<string[]>(value);

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  return (
    <FormControl error={isError} required={config.required ? true : false}>
      <FormLabel error={isError}>{answer.question.question}</FormLabel>
      <span>{config.small_label}</span>
      <FileUploadComponent
        maxFiles={config.max_files}
        id={answer.question.proposalQuestionId}
        fileType={config.file_type ? config.file_type.join(',') : ''}
        onChange={(fileMetaDataList: FileMetaData[]) => {
          const newStateValue = fileMetaDataList.map(file => file.fileId);
          setStateValue(newStateValue);
          onComplete(newStateValue);
        }}
        value={stateValue}
      />
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
