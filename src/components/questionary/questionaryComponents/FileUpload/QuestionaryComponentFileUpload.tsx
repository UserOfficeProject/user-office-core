import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
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
    question: { proposalQuestionId },
    value,
  } = answer;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = answer.config as FileUploadConfig;
  const [stateValue, setStateValue] = useState<FileIdWithCaptionAndFigure[]>(
    value
  );

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
        id={answer.question.proposalQuestionId}
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
      {isError && <FormHelperText>{errors[proposalQuestionId]}</FormHelperText>}
    </FormControl>
  );
}
