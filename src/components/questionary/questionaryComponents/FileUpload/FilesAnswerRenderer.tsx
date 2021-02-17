import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

import { FileIdWithCaptionAndFigure } from 'components/common/FileUploadComponent';
import { Answer } from 'generated/sdk';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { FileMetaData } from 'models/FileUpload';

const useStyles = makeStyles(theme => ({
  list: {
    padding: 0,
    margin: 0,
    '& li': {
      display: 'block',
      marginRight: theme.spacing(1),
    },
  },
}));

function DownloadableFileList(props: { fileIds: string[] }) {
  const { fileIds } = props;

  const classes = useStyles();
  const { files } = useFileMetadata(fileIds);

  const downloadLink = (file: FileMetaData) => (
    <Link href={`/files/download/${file.fileId}`} download>
      {file.originalFileName}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {files.map(file => (
        <li key={`file-id-${file.fileId}`}>{downloadLink(file)}</li>
      ))}
    </ul>
  );
}

function FilesAnswerRenderer(props: { answer: Answer }) {
  return (
    <div>
      <DownloadableFileList
        fileIds={props.answer.value.map(
          (fileItem: FileIdWithCaptionAndFigure) => fileItem.id
        )}
      />
    </div>
  );
}

export default FilesAnswerRenderer;
