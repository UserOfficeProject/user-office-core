import React, { ChangeEvent } from "react";
import { FileMetaData } from "../model/FileUpload";
import { useFileUpload, UPLOAD_STATE } from "../hooks/useFileUpload";
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
import ErrorIcon from '@material-ui/icons/Error';
import CancelIcon from '@material-ui/icons/Cancel';

export class FileUploadComponent extends React.Component<
  { maxFiles?: number; id?: string; fileType?: string, value:string, onChange:Function },
  { files: FileMetaData[] }
> {

  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props:any) {
    super(props);
    this.inputRef = React.createRef();
  }
  state = { files: new Array<FileMetaData>() };

  onUploadComplete(newFile: FileMetaData) {
    this.setState(prevState => ({
      files: prevState.files.concat(newFile)
    }));

    // sending event and pretending change event came from InputField
    const inputElement = this.inputRef.current!;
    let event:any = {};
    inputElement.value = this.state.files.map(metaData => metaData.file_id).join(",");
    event.target = inputElement;
    this.props.onChange(event);
    //
  }

  onDeleteClicked(deleteFile: FileMetaData) {
    this.setState(prevState => ({
      files: prevState.files.filter(fileId => fileId.file_id !== deleteFile.file_id)
    }));
  }

  render() {
    const { files } = this.state;
    const { fileType, id} = this.props;
    const maxFiles = this.props.maxFiles || 1;
    
    let newFileEntry;
    if (files.length < maxFiles) {
      newFileEntry = (
        <NewFileEntry
          filetype={fileType}
          onUploadComplete={this.onUploadComplete.bind(this)}
        />
      );
    }

  const amountFilesInfo = (maxFiles > 1) ? <span>Max: {maxFiles} file(s)</span> : null;
    return (
      <React.Fragment>
        <input type="hidden" id={id} name={id} readOnly value={this.props.value} ref={this.inputRef}/>
        {amountFilesInfo}
        <List
          component="nav"
          aria-label="main mailbox folders"
          style={{ listStyle: "none", padding: 0, marginBottom: 0 }}
        >
          {files.map((metaData: FileMetaData) => {
            return (
              <ListItem key={metaData.file_id}>
                <FileEntry
                  key={metaData.file_id}
                  onDeleteClicked={this.onDeleteClicked.bind(this)}
                  metaData={metaData}
                />
              </ListItem>
            );
          })}
          <ListItem key="addNew">
           {newFileEntry}
          </ListItem>
        </List>
      </React.Fragment>
    );
  }
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
    }
  }))(); // DRY

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
        <IconButton edge="end" aria-label="delete" onClick={() => { props.onDeleteClicked(props.metaData)}}>
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


  const {
    uploadFile,
    progress,
    state
  } = useFileUpload(props.onUploadComplete);

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    uploadFile(selectedFile!);
  };


  switch (state) 
  {
    case UPLOAD_STATE.PRISTINE:
      return (
        <React.Fragment>
          <input
            accept={props.filetype}
            style={{ display: "none" }}
            type="file"
            id="newFile"
            multiple={false}
            onChange={onFileSelected}
          />
          <label htmlFor="newFile">
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
          <ListItemSecondaryAction><CancelIcon /></ListItemSecondaryAction>
        </React.Fragment>
        );
    case UPLOAD_STATE.UPLOADING:
        return (
          <React.Fragment>
          <ListItemAvatar>
              <CircularProgress variant="static" value={progress} />
          </ListItemAvatar>
          <ListItemText primary="Uploading..." secondary={Math.round(progress) + "%"} />
          <ListItemSecondaryAction><CancelIcon /></ListItemSecondaryAction>
        </React.Fragment>
        );
  }
  return <div>Unknown state</div>
}
