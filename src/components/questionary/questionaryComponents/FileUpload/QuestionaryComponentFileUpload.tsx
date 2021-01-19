import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useEffect, useState } from 'react';

import { FileUploadComponent } from 'components/common/FileUploadComponent';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
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
    <FormControl error={isError} required={config.required} margin="dense">
      <FormLabel>
        {answer.question.question}
        {config.small_label && (
          <>
            <br />
            <small>{config.small_label}</small>
          </>
        )}
      </FormLabel>
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
      {isError && <FormHelperText>{errors[proposalQuestionId]}</FormHelperText>}
    </FormControl>
  );
}
