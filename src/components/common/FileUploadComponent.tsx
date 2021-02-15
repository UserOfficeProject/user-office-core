import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
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
import React, { ChangeEvent, useState } from 'react';

import { UPLOAD_STATE, useFileUpload } from 'hooks/common/useFileUpload';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { FileMetaData } from 'models/FileUpload';

import UOLoader from './UOLoader';

export type FileIdWithCaption = { id: string; caption?: string | null };

export function FileUploadComponent(props: {
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: FileIdWithCaption[];
  onChange: (files: FileIdWithCaption[]) => void;
}) {
  const fileIds = props.value.map(fileItem => fileItem.id);
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
      newValue.map(item => ({
        id: item.fileId,
        caption: props.value.find(
          fileAnswerItem => fileAnswerItem.id === item.fileId
        )?.caption,
      }))
    );
  };

  const onDeleteClicked = (deleteFile: FileMetaData): void => {
    const newValue = files.filter(
      fileId => fileId.fileId !== deleteFile.fileId
    );
    setFiles(newValue);
    props.onChange(
      newValue.map(item => ({
        id: item.fileId,
        caption: props.value.find(
          fileAnswerItem => fileAnswerItem.id === item.fileId
        )?.caption,
      }))
    );
  };

  const onImageCaptionAdded = (fileId: string, caption: string) => {
    props.onChange(
      props.value.map(item => {
        if (item.id === fileId) {
          return { id: item.id, caption };
        } else {
          return { id: item.id, caption: item.caption };
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
            return (
              <ListItem key={metaData.fileId}>
                <FileEntry
                  key={metaData.fileId}
                  onDeleteClicked={onDeleteClicked}
                  metaData={metaData}
                  caption={
                    props.value.find(item => item.id === metaData.fileId)
                      ?.caption
                  }
                  onImageCaptionAdded={onImageCaptionAdded}
                />
              </ListItem>
            );
          })}
        <ListItem key="addNew">{newFileEntry}</ListItem>
      </List>
    </>
  );
}

export function FileEntry(props: {
  onDeleteClicked: Function;
  metaData: FileMetaData;
  onImageCaptionAdded: Function;
  caption: string | null | undefined;
}) {
  const classes = makeStyles(theme => ({
    fileListWrapper: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    downloadLink: {
      display: 'inline-flex',
      color: 'rgba(0, 0, 0, 0.54)',
    },
    fileText: {
      maxWidth: '60%',
    },
    captionInput: {
      marginLeft: theme.spacing(2),
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
    <>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          <AttachFileIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={props.metaData.originalFileName}
        secondary={formatBytes(props.metaData.sizeInBytes)}
        className={classes.fileText}
      />
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
          <a href={downloadLink} className={classes.downloadLink} download>
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
      {(showCaption || props.caption) && (
        <TextField
          label="Image caption"
          data-cy="image-caption"
          defaultValue={props.caption || ''}
          className={classes.captionInput}
          onBlur={e =>
            props.onImageCaptionAdded(props.metaData.fileId, e.target.value)
          }
        />
      )}
    </>
  );
}

export function NewFileEntry(props: {
  filetype: string | undefined;
  onUploadComplete: (data: FileMetaData) => void;
}) {
  const classes = makeStyles(theme => ({
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
