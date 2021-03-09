import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CancelIcon from '@material-ui/icons/Cancel';
import ClosedCaption from '@material-ui/icons/ClosedCaption';
import ClosedCaptionOutlinedIcon from '@material-ui/icons/ClosedCaptionOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ErrorIcon from '@material-ui/icons/Error';
import GetAppIcon from '@material-ui/icons/GetApp';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import React, { ChangeEvent, useState } from 'react';

import { UPLOAD_STATE, useFileUpload } from 'hooks/common/useFileUpload';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { FileMetaData } from 'models/FileUpload';
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
  caption: string | null | undefined;
  figure: string | null | undefined;
}) {
  const classes = makeStyles((theme) => ({
    fileListWrapper: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    avatarWrapper: {
      maxWidth: '50px',
    },
    downloadLink: {
      display: 'inline-flex',
      color: 'rgba(0, 0, 0, 0.54)',
    },
    fileText: {
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
    },
    captionInput: {
      marginLeft: theme.spacing(2),
    },
    infoIcon: {
      fill: 'rgba(0, 0, 0, 0.54)',
      width: '20px',
      cursor: 'auto',
    },
  }))();

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
      <Grid item xs={1} className={classes.avatarWrapper}>
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <AttachFileIcon />
          </Avatar>
        </ListItemAvatar>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" alignItems="center">
          <ListItemText
            primary={props.metaData.originalFileName}
            secondary={formatBytes(props.metaData.sizeInBytes)}
            className={classes.fileText}
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
                <a
                  href={downloadLink}
                  className={classes.downloadLink}
                  download
                >
                  <GetAppIcon />
                </a>
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
          <Grid item xs={6}>
            <TextField
              label="Figure"
              data-cy="image-figure"
              defaultValue={props.figure || ''}
              className={classes.captionInput}
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
                      <InfoOutlined className={classes.infoIcon} />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>
          {(showCaption || props.caption) && (
            <Grid item xs={6}>
              <TextField
                label="Image caption"
                data-cy="image-caption"
                defaultValue={props.caption || ''}
                className={classes.captionInput}
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
  const classes = makeStyles((theme) => ({
    fileListWrapper: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    addIcon: {
      marginRight: theme.spacing(1),
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  }))();

  const { uploadFile, progress, state, abort } = useFileUpload();

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    uploadFile(selectedFile, props.onUploadComplete);
  };

  switch (state) {
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
          <Button variant="outlined" component="span">
            <AddCircleOutlineIcon className={classes.addIcon} /> Attach file
          </Button>
        </label>
      );
    case UPLOAD_STATE.ERROR:
      return (
        <>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <ErrorIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Error occurred" />
          <ListItemSecondaryAction>
            <CancelIcon onClick={() => abort()} />
          </ListItemSecondaryAction>
        </>
      );
    case UPLOAD_STATE.ABORTED:
      return (
        <>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
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
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: FileIdWithCaptionAndFigure[];
  onChange: (files: FileIdWithCaptionAndFigure[]) => void;
}) {
  const fileIds = props.value.map((fileItem) => fileItem.id);
  const { files, setFiles } = useFileMetadata(fileIds);

  const classes = makeStyles(() => ({
    questionnairesList: {
      listStyle: 'none',
      padding: 0,
      marginBottom: 0,
      '& li': {
        paddingLeft: 0,
      },
    },
  }))();

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
  const maxFiles = props.maxFiles || 1;

  let newFileEntry;
  if (files.length < maxFiles) {
    newFileEntry = (
      <NewFileEntry filetype={fileType} onUploadComplete={onUploadComplete} />
    );
  }

  const amountFilesInfo =
    maxFiles > 1 ? <span>Max: {maxFiles} file(s)</span> : null;

  return (
    <>
      {amountFilesInfo}
      <List component="ul" className={classes.questionnairesList}>
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
        <ListItem key="addNew">{newFileEntry}</ListItem>
      </List>
    </>
  );
}
