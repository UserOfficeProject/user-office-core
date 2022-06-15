import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import React, { useEffect, useState } from 'react';

import {
  FileIdWithCaptionAndFigure,
  FileUploadComponent,
} from 'components/common/FileUploadComponent';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { FileUploadConfig } from 'generated/sdk';

export function QuestionaryComponentFileUpload(
  props: BasicComponentProps & { files?: string[] }
) {
  const {
    answer,
    onComplete,
    formikProps: { errors },
  } = props;
  const {
    question: { id },
    value,
  } = answer;
  const isError = errors[id] ? true : false;
  const config = answer.config as FileUploadConfig;
  const [stateValue, setStateValue] =
    useState<FileIdWithCaptionAndFigure[]>(value);

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  return (
    <FormControl
      error={isError}
      required={config.required}
      margin="dense"
      fullWidth
    >
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
        id={answer.question.id}
        fileType={config.file_type ? config.file_type.join(',') : ''}
        onChange={(fileMetaDataList: FileIdWithCaptionAndFigure[]) => {
          const newStateValue = fileMetaDataList.map((file) => ({
            id: file.id,
            caption: file.caption,
            figure: file.figure,
          }));

          setStateValue(newStateValue);
          onComplete(newStateValue);
        }}
        value={stateValue}
      />
      {isError && <FormHelperText>{errors[id]}</FormHelperText>}
    </FormControl>
  );
}
