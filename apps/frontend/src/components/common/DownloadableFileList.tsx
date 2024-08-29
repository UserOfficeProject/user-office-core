import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';

import { useFilesMetadata } from 'hooks/file/useFilesMetadata';
import { FileMetaData } from 'models/questionary/FileUpload';

export function DownloadableFileList(props: { fileIds: string[] }) {
  const { fileIds } = props;
  const { files } = useFilesMetadata({ fileIds });

  const downloadLink = (file: FileMetaData) => (
    <Link href={`/files/download/${file.fileId}`} download>
      {file.originalFileName}
    </Link>
  );

  return (
    <List
      sx={(theme) => ({
        padding: 0,
        margin: 0,
        '& li': {
          display: 'block',
          marginRight: theme.spacing(1),
        },
      })}
    >
      {files.map((file) => (
        <ListItem key={`file-id-${file.fileId}`}>{downloadLink(file)}</ListItem>
      ))}
    </List>
  );
}
