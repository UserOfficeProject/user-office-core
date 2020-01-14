import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { FileMetaData } from "../models/FileUpload";
import {
  useFileUpload,
  useGetFileMetadata,
  UPLOAD_STATE
} from "../hooks/useFileUpload";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import {
  IconButton,
  CircularProgress,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  makeStyles,
  List
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import GetAppIcon from "@material-ui/icons/GetApp";
import ErrorIcon from "@material-ui/icons/Error";
import CancelIcon from "@material-ui/icons/Cancel";
import { usePrevious } from "../hooks/usePrevious";

export function FileUploadComponent(props: {
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: string;
  onChange: Function;
  className?: string;
}) {
  const { getFileMetadata, filesMetadata } = useGetFileMetadata();
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const previousFiles = usePrevious(files);
  const inputRef = useRef(null);

  const classes = makeStyles(theme => ({
    list: {
      listStyle: "none",
      padding: 0,
      marginBottom: 0,
      "& li": {
        paddingLeft: 0
      }
    }
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
      getFileMetadata(props.value.split(","));
    }
  }, []);

  useEffect(() => {
    setFiles(filesMetadata);
  }, [filesMetadata]);

  const onUploadComplete = (newFile: FileMetaData) => {
    setFiles(files.concat(newFile));
    dispatchChange();
  };

  const onDeleteClicked = (deleteFile: FileMetaData) => {
    setFiles(files.filter(fileId => fileId.fileId !== deleteFile.fileId));
    dispatchChange();
  };

  const dispatchChange = () => {
    const inputElement: HTMLInputElement = inputRef.current!;
    let event: any = {};
    event.target = inputElement;
    props.onChange(event);
  }

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
        value={files.map(metaData => metaData.fileId).join(",")}
        ref={inputRef}
      />
      {amountFilesInfo}
      <List component="ul" className={classes.list}>
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
      marginBottim: theme.spacing(2)
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: "white"
    },
    downloadLink: {
      display: "inline-flex",
      color: "rgba(0, 0, 0, 0.54)"
    }
  }))();

  const downloadLink = `/files/download/${props.metaData.fileId}`; // TODO to get a path to server? Or how to allow download via proxy

  const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
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
          onClick={() => {
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
      marginBottim: theme.spacing(2)
    },
    addIcon: {
      marginRight: theme.spacing(1)
    },
    avatar: {
      backgroundColor: theme.palette.primary.main,
      color: "white"
    }
  }))(); // DRY

  const { uploadFile, progress, state, abort } = useFileUpload();

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    uploadFile(selectedFile!, props.onUploadComplete);
  };

  switch (state) {
    case UPLOAD_STATE.PRISTINE:
      return (
        <>
          <label>
            <input
              accept={props.filetype}
              style={{ display: "none" }}
              type="file"
              multiple={false}
              onChange={onFileSelected}
            />
            <Button variant="outlined" component="span">
              <AddCircleOutlineIcon className={classes.addIcon} /> Attach file
            </Button>
          </label>
        </>
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
            <CircularProgress variant="static" value={progress} />
          </ListItemAvatar>
          <ListItemText
            primary="Uploading..."
            secondary={Math.round(progress) + "%"}
          />
          <ListItemSecondaryAction>
            {/* Add cancel upload button */}
          </ListItemSecondaryAction>
        </>
      );
  }
  return <div>Unknown state</div>;
}
