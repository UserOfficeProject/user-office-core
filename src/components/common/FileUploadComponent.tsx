import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import withStyles from '@material-ui/core/styles/withStyles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ErrorIcon from '@material-ui/icons/Error';
import GetAppIcon from '@material-ui/icons/GetApp';
import React, { ChangeEvent } from 'react';

import { UPLOAD_STATE, useFileUpload } from 'hooks/common/useFileUpload';
import { useFileMetadata } from 'hooks/file/useFileMetadata';
import { FileMetaData } from 'models/FileUpload';

import UOLoader from './UOLoader';

export function FileUploadComponent(props: {
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: string[];
  onChange: (files: FileMetaData[]) => any;
}) {
  const { files, setFiles } = useFileMetadata(props.value);

  const classes = makeStyles(() => ({
    questionariesList: {
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
    props.onChange(newValue);
  };

  const onDeleteClicked = (deleteFile: FileMetaData): void => {
    const newValue = files.filter(
      fileId => fileId.fileId !== deleteFile.fileId
    );
    setFiles(newValue);
    props.onChange(newValue);
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
      <List component="ul" className={classes.questionariesList}>
        {files.map &&
          files.map((metaData: FileMetaData) => {
            return (
              <ListItem key={metaData.fileId}>
                <FileEntry
                  key={metaData.fileId}
                  onDeleteClicked={onDeleteClicked}
                  metaData={metaData}
                />
              </ListItem>
            );
          })}
        <ListItem key="addNew">{newFileEntry}</ListItem>
      </List>
    </>
  );
}

const ListItemWithWiderSecondaryAction = withStyles({
  secondaryAction: {
    paddingRight: 96,
    width: 400,
    maxWidth: 400,
  },
})(ListItem);

export function FileEntry(props: {
  onDeleteClicked: Function;
  metaData: FileMetaData;
}) {
  const classes = makeStyles(theme => ({
    fileListWrapper: {
      marginTop: theme.spacing(2),
      marginBottim: theme.spacing(2),
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    downloadLink: {
      display: 'inline-flex',
      color: 'rgba(0, 0, 0, 0.54)',
    },
  }))();

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
    <ListItemWithWiderSecondaryAction button>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          <AttachFileIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={props.metaData.originalFileName}
        secondary={formatBytes(props.metaData.sizeInBytes)}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end">
          <a href={downloadLink} className={classes.downloadLink} download>
            <GetAppIcon />
          </a>
        </IconButton>
        <IconButton
          edge="end"
          onClick={(): void => {
            props.onDeleteClicked(props.metaData);
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItemWithWiderSecondaryAction>
  );
}

export function NewFileEntry(props: {
  filetype: string | undefined;
  onUploadComplete: (data: FileMetaData) => any;
}) {
  const classes = makeStyles(theme => ({
    fileListWrapper: {
      marginTop: theme.spacing(2),
      marginBottim: theme.spacing(2),
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
            <UOLoader variant="static" value={progress} />
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
