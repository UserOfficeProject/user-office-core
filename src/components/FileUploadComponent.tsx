import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { FileMetaData } from "../model/FileUpload";
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
  List} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import GetAppIcon from "@material-ui/icons/GetApp";
import ErrorIcon from "@material-ui/icons/Error";
import CancelIcon from "@material-ui/icons/Cancel";

export function FileUploadComponent(props: {
  maxFiles?: number;
  id?: string;
  fileType?: string;
  value: string;
  onChange: Function;
}) {
  const { getFileMetadata, filesMetadata } = useGetFileMetadata();
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const inputRef = useRef(null);

  const classes = makeStyles(theme => ({
    list: {
      listStyle: "none",
      padding: 0, 
      marginBottom: 0,
      '& li': {
        paddingLeft: 0
      }
    }
  }))();

   
  useEffect(() => {
    const inputElement: HTMLInputElement = inputRef.current!;
    let event: any = {};
    event.target = inputElement;
    props.onChange(event);
  }, [files]);  // eslint-disable-line react-hooks/exhaustive-deps, run only when files change

  useEffect(() => {
    if (props.value) {
      getFileMetadata(props.value.split(","));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps, run only once in the beginning

  useEffect(() => {
    setFiles(filesMetadata);
  }, [filesMetadata]);

  const onUploadComplete = (newFile: FileMetaData) => {
    setFiles(files.concat(newFile));
  };

  const onDeleteClicked = (deleteFile: FileMetaData) => {
    setFiles(files.filter(fileId => fileId.fileId !== deleteFile.fileId));
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
    <React.Fragment>
      <input
        type="hidden"
        id={id}
        name={id}
        readOnly
        value={files.map(metaData => metaData.fileId).join(",")}
        ref={inputRef}
      />
      {amountFilesInfo}
      <List
        component="ul"
        className={classes.list}
      >
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
    </React.Fragment>
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
      display:"inline-flex",
      color:"rgba(0, 0, 0, 0.54)"
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
    <React.Fragment>
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
          <a href={downloadLink} className={classes.downloadLink} download><GetAppIcon /></a>
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
    </React.Fragment>
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

  const { uploadFile, progress, state } = useFileUpload();

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    uploadFile(selectedFile!, props.onUploadComplete);
  };

  switch (state) {
    case UPLOAD_STATE.PRISTINE:
      return (
        <React.Fragment>
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
        </React.Fragment>
      );
    case UPLOAD_STATE.ERROR:
      return (
        <React.Fragment>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <ErrorIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Error occurred" />
          <ListItemSecondaryAction>
            <CancelIcon />
          </ListItemSecondaryAction>
        </React.Fragment>
      );
    case UPLOAD_STATE.ABORTED:
      return (
        <React.Fragment>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <CancelIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Upload cancelled" />
          <ListItemSecondaryAction>
            <CancelIcon />
          </ListItemSecondaryAction>
        </React.Fragment>
      );
    case UPLOAD_STATE.UPLOADING:
      return (
        <React.Fragment>
          <ListItemAvatar>
            <CircularProgress variant="static" value={progress} />
          </ListItemAvatar>
          <ListItemText
            primary="Uploading..."
            secondary={Math.round(progress) + "%"}
          />
          <ListItemSecondaryAction>
            <CancelIcon />
          </ListItemSecondaryAction>
        </React.Fragment>
      );
  }
  return <div>Unknown state</div>;
}
