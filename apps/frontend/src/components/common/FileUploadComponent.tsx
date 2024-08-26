import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CancelIcon from '@mui/icons-material/Cancel';
import ClosedCaption from '@mui/icons-material/ClosedCaption';
import ClosedCaptionOutlinedIcon from '@mui/icons-material/ClosedCaptionOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorIcon from '@mui/icons-material/Error';
import GetAppIcon from '@mui/icons-material/GetApp';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { getType } from 'mime';
import React, { ChangeEvent, useState } from 'react';

import { Maybe } from 'generated/sdk';
import { UPLOAD_STATE, useFileUpload } from 'hooks/common/useFileUpload';
import { useFilesMetadata } from 'hooks/file/useFilesMetadata';
import { FileMetaData } from 'models/questionary/FileUpload';
import { FunctionType } from 'utils/utilTypes';

import UOLoader from './UOLoader';

export type FileIdWithCaptionAndFigure = {
  id: string;
  caption?: string | null;
  figure?: string | null;
};

export function FileEntry(props: {
  onDeleteClicked: FunctionType<void, FileMetaData>;
  metaData: FileMetaData;
  onImageCaptionOrFigureAdded: FunctionType<void, FileIdWithCaptionAndFigure>;
  caption?: Maybe<string>;
  figure?: Maybe<string>;
}) {
  const theme = useTheme();
  const [showCaption, setShowCaption] = useState(false);

  const downloadLink = `/files/download/${props.metaData.fileId}`;

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Grid container alignItems="center">
      <Grid item xs={1} sx={{ maxWidth: '50px' }}>
        <ListItemAvatar>
          <Avatar
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
            }}
          >
            <AttachFileIcon />
          </Avatar>
        </ListItemAvatar>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" alignItems="center">
          <ListItemText
            primary={props.metaData.originalFileName}
            secondary={formatBytes(props.metaData.sizeInBytes)}
            sx={{
              display: 'inline-flex',
              maxWidth: '70%',
              '& span': {
                width: '80%',
                overflow: 'hidden',
              },
              '& p': {
                paddingLeft: theme.spacing(1),
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />

          <Box display="inline-flex">
            {props.metaData.mimeType.startsWith('image') && (
              <Tooltip title="Add image caption">
                <IconButton
                  edge="end"
                  onClick={(): void => setShowCaption(!showCaption)}
                >
                  {showCaption || props.caption ? (
                    <ClosedCaption />
                  ) : (
                    <ClosedCaptionOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download file">
              <IconButton edge="end">
                <Link
                  href={downloadLink}
                  sx={{
                    display: 'inline-flex',
                    color: 'rgba(0, 0, 0, 0.54)',
                  }}
                  download
                >
                  <GetAppIcon />
                </Link>
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove file">
              <IconButton
                edge="end"
                onClick={(): void => {
                  props.onDeleteClicked(props.metaData);
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={5}>
        <Grid container spacing={1}>
          {props.metaData.mimeType.startsWith('image') && (
            <Grid item xs={6}>
              <TextField
                label="Figure"
                data-cy="image-figure"
                defaultValue={props.figure || ''}
                sx={{
                  marginLeft: theme.spacing(2),
                }}
                onBlur={(e) =>
                  props.onImageCaptionOrFigureAdded({
                    id: props.metaData.fileId,
                    caption: props.caption,
                    figure: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Use figure to reference the image inside the rich text editor">
                        <InfoOutlined
                          sx={{
                            fill: 'rgba(0, 0, 0, 0.54)',
                            width: '20px',
                            cursor: 'auto',
                          }}
                        />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
          )}
          {(showCaption || props.caption) && (
            <Grid item xs={6}>
              <TextField
                label="Image caption"
                data-cy="image-caption"
                defaultValue={props.caption || ''}
                sx={{
                  marginLeft: theme.spacing(2),
                }}
                onBlur={(e) =>
                  props.onImageCaptionOrFigureAdded({
                    id: props.metaData.fileId,
                    caption: e.target.value,
                    figure: props.figure,
                  })
                }
                fullWidth
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export function NewFileEntry(props: {
  filetype: string | undefined;
  onUploadComplete: (data: FileMetaData) => void;
}) {
  const theme = useTheme();
  const { uploadFile, progress, state, setState, abort } = useFileUpload();

  const hasValidContentHeader = (file: File): boolean => {
    if (!props.filetype) {
      return true;
    }

    const allowedTypes: string[] = [];

    props.filetype.split(',').forEach((extOrMime) => {
      const posMime = getType(extOrMime);

      if (posMime) {
        allowedTypes.push(posMime);
      } else {
        allowedTypes.push(extOrMime);
      }
    });

    const anySubtype = file.type.split('/')[0]?.concat('/*'); // e.g. 'image/*'

    return (
      allowedTypes.includes(file.type) || allowedTypes.includes(anySubtype)
    );
  };

  const hasExtension = (file: File) => {
    return file.name.split('.').length - 1 >= 1;
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    if (hasExtension(selectedFile) && hasValidContentHeader(selectedFile)) {
      uploadFile(selectedFile, props.onUploadComplete);
    } else {
      setState(UPLOAD_STATE.REJECTED);
    }
  };

  switch (state) {
    case UPLOAD_STATE.REJECTED:
      return (
        <>
          <ListItemAvatar>
            <Avatar
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }}
            >
              <ErrorIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Incorrect file type"
            secondary="Ensure that the file is of the correct type and has an extension."
          />
          <ListItemSecondaryAction>
            <CancelIcon onClick={() => abort()} />
          </ListItemSecondaryAction>
        </>
      );
    case UPLOAD_STATE.ERROR:
      return (
        <>
          <ListItemAvatar>
            <Avatar
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }}
            >
              <ErrorIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Error occurred" />
          <ListItemSecondaryAction>
            <CancelIcon onClick={() => abort()} />
          </ListItemSecondaryAction>
        </>
      );
    case UPLOAD_STATE.PRISTINE:
      return (
        <label>
          <input
            accept={props.filetype}
            style={{ display: 'none' }}
            type="file"
            multiple={false}
            onChange={onFileSelected}
          />
          <Button
            variant="outlined"
            component="span"
            data-cy="attach-file-button"
          >
            <AddCircleOutlineIcon
              sx={{
                marginRight: theme.spacing(1),
              }}
            />{' '}
            Attach file
          </Button>
        </label>
      );
    case UPLOAD_STATE.ABORTED:
      return (
        <>
          <ListItemAvatar>
            <Avatar
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }}
            >
              <CancelIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Upload cancelled" />
          <ListItemSecondaryAction>
            <CancelIcon onClick={() => abort()} />
          </ListItemSecondaryAction>
        </>
      );
    case UPLOAD_STATE.UPLOADING:
      return (
        <>
          <ListItemAvatar>
            <UOLoader variant="determinate" value={progress} />
          </ListItemAvatar>
          <ListItemText
            primary="Uploading..."
            secondary={Math.round(progress) + '%'}
          />
          <ListItemSecondaryAction>
            {/* Add cancel upload button */}
          </ListItemSecondaryAction>
        </>
      );
  }

  return <div>Unknown state</div>;
}

export function FileUploadComponent(props: {
  maxFiles?: number; // 0 is unlimited
  id?: string;
  fileType: string;
  pdfPageLimit: number; // 0 is unlimited
  omitFromPdf: boolean;
  value: FileIdWithCaptionAndFigure[];
  onChange: (files: FileIdWithCaptionAndFigure[]) => void;
  deleteAllOption?: boolean;
}) {
  const fileIds = props.value.map((fileItem) => fileItem.id);
  const { files, setFiles } = useFilesMetadata({ fileIds });

  const onUploadComplete = (newFile: FileMetaData): void => {
    const newValue = files.concat(newFile);
    setFiles(newValue);
    props.onChange(
      newValue.map((item) => ({
        id: item.fileId,
        caption: props.value.find(
          (fileAnswerItem) => fileAnswerItem.id === item.fileId
        )?.caption,
      }))
    );
  };

  const onDeleteClicked = (deleteFile: FileMetaData): void => {
    const newValue = files.filter(
      (fileId) => fileId.fileId !== deleteFile.fileId
    );
    setFiles(newValue);
    props.onChange(
      newValue.map((item) => ({
        id: item.fileId,
        caption: props.value.find(
          (fileAnswerItem) => fileAnswerItem.id === item.fileId
        )?.caption,
      }))
    );
  };

  const onDeleteAllClicked = () => {
    setFiles([]);
    props.onChange([]);
  };

  const onImageCaptionOrFigureAdded = ({
    id: fileId,
    caption,
    figure,
  }: FileIdWithCaptionAndFigure) => {
    props.onChange(
      props.value.map((item) => {
        if (item.id === fileId) {
          return { id: item.id, caption, figure };
        } else {
          return { id: item.id, caption: item.caption, figure: item.figure };
        }
      })
    );
  };

  const { fileType } = props;
  const { pdfPageLimit } = props;
  const maxFiles = props.maxFiles ?? 0;

  let newFileEntry;
  if (files.length < maxFiles || maxFiles === 0) {
    newFileEntry = (
      <NewFileEntry filetype={fileType} onUploadComplete={onUploadComplete} />
    );
  }

  const amountFilesInfo =
    maxFiles > 1 ? (
      <Box component="span" display="block">
        Maximum {maxFiles} file(s)
      </Box>
    ) : null;

  const fileTypeInfo = fileType.split(',').map((type) => {
    return type.includes('*') ? 'any ' + type.split('/')[0] : type;
  });

  const pdfPageLimitInfo =
    fileType.includes('.pdf') && pdfPageLimit > 0 ? (
      <Box component="span" display="block">
        Maximum {pdfPageLimit} PDF page(s) per file
      </Box>
    ) : null;

  return (
    <>
      Accepted formats: {fileTypeInfo.join(', ')}
      {amountFilesInfo}
      {pdfPageLimitInfo}
      <List
        component="ul"
        sx={{
          listStyle: 'none',
          padding: 0,
          marginBottom: 0,
          '& li': {
            paddingLeft: 0,
          },
        }}
      >
        {files.map &&
          files.map((metaData: FileMetaData) => {
            const currentFileAnswerValues = props.value.find(
              (item) => item.id === metaData.fileId
            );

            return (
              <ListItem key={metaData.fileId}>
                <FileEntry
                  key={metaData.fileId}
                  onDeleteClicked={onDeleteClicked}
                  metaData={metaData}
                  caption={currentFileAnswerValues?.caption}
                  figure={currentFileAnswerValues?.figure}
                  onImageCaptionOrFigureAdded={onImageCaptionOrFigureAdded}
                />
              </ListItem>
            );
          })}
        <ListItem key="addNew">
          {newFileEntry}
          {props.deleteAllOption && (
            <Button
              sx={{ marginLeft: '10px' }}
              data-cy="delete-all"
              onClick={() => onDeleteAllClicked()}
            >
              Remove All
            </Button>
          )}
        </ListItem>
      </List>
    </>
  );
}
