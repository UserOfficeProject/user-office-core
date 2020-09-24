import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ErrorIcon from '@material-ui/icons/Error';
import GetAppIcon from '@material-ui/icons/GetApp';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { UPLOAD_STATE, useFileUpload } from 'hooks/common/useFileUpload';
import { usePrevious } from 'hooks/common/usePrevious';
import { FileMetaData } from 'models/FileUpload';

import UOLoader from './UOLoader';

export function FileUploadComponent(props: {
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: string[];
  onChange: Function;
  className?: string;
}) {
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const previousFiles = usePrevious(files);
  const inputRef = useRef(null);
  const api = useDataApi();

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

  useEffect(() => {
    if (previousFiles === undefined) {
      return; // first call
    }

    if (previousFiles.length === files.length) {
      return; // no files added or removed
    }
  }, [files, previousFiles]);

  useEffect(() => {
    if (props.value) {
      api()
        .getFileMetadata({ fileIds: props.value })
        .then(data => {
          setFiles(data?.fileMetadata || []);
        });
    }
  }, [api, props.value]);

  const dispatchChange = (): void => {
    const inputElement: HTMLInputElement = inputRef.current!;
    const event: any = {};
    event.target = inputElement;
    props.onChange(event);
  };

  const onUploadComplete = (newFile: FileMetaData): void => {
    setFiles(files.concat(newFile));
    dispatchChange();
  };

  const onDeleteClicked = (deleteFile: FileMetaData): void => {
    setFiles(files.filter(fileId => fileId.fileId !== deleteFile.fileId));
    dispatchChange();
  };

  const { fileType, id } = props;
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
      <input
        type="hidden"
        id={id}
        name={id}
        readOnly
        value={files.map(metaData => metaData.fileId).join(',')}
        ref={inputRef}
      />
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

  const downloadLink = `/files/download/${props.metaData.fileId}`; // TODO to get a path to server? Or how to allow download via proxy

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
    </>
  );
}

export function NewFileEntry(props: {
  filetype: string | undefined;
  onUploadComplete: Function;
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
