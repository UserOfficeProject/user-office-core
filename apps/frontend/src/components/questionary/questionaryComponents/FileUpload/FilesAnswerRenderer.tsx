import React from 'react';

import { DownloadableFileList } from 'components/common/DownloadableFileList';
import { FileIdWithCaptionAndFigure } from 'components/common/FileUploadComponent';
import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const FilesAnswerRenderer: AnswerRenderer = ({ value }) => (
  <div>
    <DownloadableFileList
      fileIds={value.map((fileItem: FileIdWithCaptionAndFigure) => fileItem.id)}
    />
  </div>
);

export default FilesAnswerRenderer;
