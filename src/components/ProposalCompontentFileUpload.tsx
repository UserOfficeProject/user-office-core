import React, { useState, ChangeEvent } from "react";
import { FormControl, FormLabel, makeStyles, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, Button, LinearProgress, CircularProgress } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { FileMetaData } from '../model/FileUpload';
import { useFileUpload } from '../hooks/useFileUpload';
import CheckIcon from '@material-ui/icons/Check';

export class ProposalCompontentFileUpload extends React.Component<IBasicComponentProps, {files: string[];}> {
  state = { files: new Array<string>() };

  onFileSelected(selected: string) {
    var { files } = this.state;
    files.push(selected);
    this.setState({ files: files });
  }

  onDeleteClicked(deleteFileId: string) {
    var { files } = this.state;
    files = files.filter(fileId => fileId !== deleteFileId);
    this.setState({ files: files });
  }

  getUniqueFileId() {
    return `${this.props.templateField.proposal_question_id}_${new Date().getTime()}`;
  }

  render() {
    let { templateField, touched, errors } = this.props;
    let { proposal_question_id, config } = templateField;
    let isError = touched[proposal_question_id] && errors[proposal_question_id]? true: false;
    let curFileList = this.state.files;
    // clone the state, because we might modify the array
    let listItems = curFileList.slice(0);
    let maxFilesAllowed = config.maxFiles || 1; 
    if (maxFilesAllowed > listItems.length) {
      listItems.push(this.getUniqueFileId()); // new file entry
    }
    return (
    <FormControl error={isError}>
      <FormLabel error={isError}>{templateField.question}</FormLabel>
      <span>{templateField.config.small_label}</span>
      <ul style={{ listStyle: "none", padding: 0, marginBottom: 0 }}>
      {listItems.map((fileId: string) => {
          return (<FileEntry key={fileId} filetype={config.filetype} fileId={fileId} onFileSelected={this.onFileSelected.bind(this)} onDeleteClicked={this.onDeleteClicked.bind(this)} />);
        })}
      </ul>
      <span>{config.small_label}</span>
      {isError && <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>}
    </FormControl>
    );
  }
}


export function FileEntry(props: {
    fileId: string;
    filetype: string | undefined;
    onFileSelected: Function;
    onDeleteClicked: Function;
  }) {
    const [file, setFile] = useState<File | null>(null);
    const [metaData, setMetaData]= useState<FileMetaData | null>(null);
    const {uploadFile, progress, isError, isAborted, isComplete} = useFileUpload();

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
    }))();

    const formatBytes = (bytes: number, decimals: number = 2): string => {
      if (bytes === 0) return "0 Bytes";
  
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
      let selectedFile = e.target.files ? e.target.files[0] : null;
      if(!selectedFile) return;

      uploadFile(selectedFile!);
      props.onFileSelected(props.fileId);
      setFile(selectedFile);
    };

    const onDeleteClicked = () => {
      props.onDeleteClicked(props.fileId);

    }
  
    
    const fileInput = (
      <input
        accept={props.filetype}
        style={{ display: 'none' }}
        type="file"
        id={props.fileId}
        multiple={false}
        onChange={onFileSelected}
      />
    );

    let progressTag;
    if(isComplete)
    {
      progressTag = <IconButton edge="end" aria-label="delete"><CheckIcon /></IconButton>
    } 
    else if(isError) {
      progressTag = <div>error</div>
    }
    else if(isAborted) {
      progressTag = <div>Aborted</div>
    }
    else
    {
      progressTag =<IconButton edge="end" aria-label="delete"><CircularProgress variant="static" value={progress}  /></IconButton>
    }

    if (file) {
      return (
        <ListItem>
          {fileInput}
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <AttachFileIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={file.name} secondary={formatBytes(file.size)} />
          <ListItemSecondaryAction>
          {progressTag}
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={onDeleteClicked}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </ListItemSecondaryAction>
          
        </ListItem>
      );
    }
  else {
    return (
      <ListItem className={classes.fileListWrapper}>
        {fileInput}
        <label htmlFor={props.fileId}>
          <Button variant="outlined" component="span">
            <AddCircleOutlineIcon className={classes.addIcon} /> Attach file
          </Button>
        </label>
      </ListItem>
    );
  }
 }