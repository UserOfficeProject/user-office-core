import React, { useState } from "react";
import { FormControl, FormLabel, makeStyles, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, Button } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';

export class ProposalCompontentFileUpload extends React.Component<IBasicComponentProps, {files: string[];}> {
  state = { files: new Array<string>() };

  onFileSelected(selected: string) {
    var files = this.state.files;
    files.push(selected);
    this.setState({ files: files });
  }

  onDeleteClicked(deleteFileId: string) {
    this.setState({ files: this.state.files.filter(fileId => fileId !== deleteFileId) });
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
    if (!config.maxFiles || config.maxFiles < listItems.length) {
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
  
    const [file, setFile] = useState<File | null>(null);
    const fileInput = (
      <input
        accept={props.filetype}
        style={{ display: 'none' }}
        type="file"
        id={props.fileId}
        multiple={false}
        onChange={e => {
          let selectedFile = e.target.files ? e.target.files[0] : null;
          setFile(selectedFile);
          props.onFileSelected(props.fileId);
        }}
      />
    );
  
    const formatBytes = (bytes: number, decimals: number = 2): string => {
      if (bytes === 0) return "0 Bytes";
  
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };
  
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
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => {
                props.onDeleteClicked(props.fileId);
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  
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