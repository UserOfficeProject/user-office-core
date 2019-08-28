import React, { ChangeEvent, useState } from "react";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, makeStyles, Checkbox, InputLabel, Select, MenuItem, Button, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton } from "@material-ui/core";
import JSDict from "../utils/Dictionary";
import * as Yup from "yup";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AttachFileIcon from '@material-ui/icons/AttachFile';

export function ProposalComponentTextInput(props:IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: "15px 0 10px 0"
    }
  })();

  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;

    return (
      <div>
        <TextField
          id={proposal_question_id}
          name={proposal_question_id}
          fullWidth
          label={question}
          value={templateField.value}
          onChange={(evt: ChangeEvent<HTMLInputElement>) => {
            templateField.value = evt.target.value;
            handleChange(evt); // letting Formik know that there was a change
          }}
          onBlur={() => onComplete()}
          placeholder={config.small_label}
          error={isError}
          helperText={errors[proposal_question_id]}
          multiline={config.multiline}
          rows={config.multiline?4:1}
          className={classes.textField}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
    );
}

export function ProposalComponentMultipleChoice(props: IBasicComponentProps) {
  const classes = makeStyles({
    horizontalLayout: {
      flexDirection: "row"
    },
    verticalLayout: {
      flexDirection: "column"
    },
    wrapper: {
      margin: "18px 0 0 0",
      display: "flex"
    }
  })();

  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;
  switch (templateField.config.variant) {
    case "dropdown":
      return (
        <FormControl className={classes.wrapper} error={isError}>
          <InputLabel htmlFor={proposal_question_id} shrink>{question}</InputLabel>
          <span>{templateField.config.small_label}</span>
          <Select
            id={proposal_question_id}
            name={proposal_question_id}
            value={templateField.value}
            onChange={evt => {
              templateField.value = (evt.target as HTMLInputElement).value;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
          >
            {(config.options as string[]).map(option => {
              return <MenuItem value={option} key={option}>{option}</MenuItem>;
            })}
          </Select>
          {isError && <ErrorLabel>{errors[proposal_question_id]}</ErrorLabel>}
        </FormControl>
      );
    default:
      return (
        <FormControl className={classes.wrapper} error={isError}>
        <FormLabel>{templateField.question}</FormLabel>
        <span>{templateField.config.small_label}</span>
        <RadioGroup
          id={templateField.proposal_question_id}
          name={templateField.proposal_question_id}
            onChange={evt => {
              templateField.value = (evt.target as HTMLInputElement).value;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            className={
              config.options.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {(config.options as string[]).map(option => {
              return (
                <FormControlLabel
                  value={option}
                  key={option}
                  control={<Radio />}
                  label={option}
                />
              );
            })}
          </RadioGroup>
          {isError && <ErrorLabel>{errors[proposal_question_id]}</ErrorLabel>}
        </FormControl>
      );
  }
}



export function ProposalComponentCheckBox(props: IBasicComponentProps) {
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;

  return (
      <FormControl error={isError}>
      <FormControlLabel
        control={
          <Checkbox
            id={proposal_question_id}
            name={proposal_question_id}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              templateField.value = evt.target.checked;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
          />
        }
        label={question}
      />
      <span>{config.small_label}</span>
      {isError && <ErrorLabel>{errors[proposal_question_id]}</ErrorLabel>}
      </FormControl>
  );
}



export function ProposalCompontentDatePicker(props: IBasicComponentProps)
{
  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;
  if(!templateField.value) {
    templateField.value = new Date();
  }
  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
          error={isError}
          disableToolbar
          variant="inline"
          format="dd/MMM/yyyy"
          id={proposal_question_id}
          name={proposal_question_id}
          label={question}
          value={templateField.value}
          onChange={(date, val) => {
            templateField.value = val;
            handleChange(val); // letting Formik know that there was a change;
            onComplete();
          }}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        </MuiPickersUtilsProvider>
      <span>{config.small_label}</span>
      {isError && <ErrorLabel>{errors[proposal_question_id]}</ErrorLabel>}
    </FormControl>
  );
}



export class ProposalCompontentFileUpload extends React.Component<IBasicComponentProps,{ files: string[] }> {
  state = { files: new Array<string>() };

  onFileSelected(selected: string) {
    var files = this.state.files;
    files.push(selected);
    this.setState({ files: files });
  }

  onDeleteClicked(deleteFileId: string) {
    this.setState({ files: this.state.files.filter(fileId => fileId != deleteFileId) });
  }

  getUniqueFileId() {
    return `${this.props.templateField.proposal_question_id}_${new Date().getTime()}`;
  }
  
  render() {
    let { templateField, touched, errors } = this.props;
    let { proposal_question_id, config } = templateField;
    let isError =
      touched[proposal_question_id] && errors[proposal_question_id]
        ? true
        : false;
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
        <ul style={{listStyle: "none", padding: 0,marginBottom: 0}}>
          {listItems.map((fileId: string) => {
            return (
              <FileEntry
                key={fileId}
                filetype={config.filetype}
                fileId={fileId}
                onFileSelected={this.onFileSelected.bind(this)}
                onDeleteClicked={this.onDeleteClicked.bind(this)}
              />
            );
          })}
        </ul>
        <span>{config.small_label}</span>
        {isError && <ErrorLabel>{errors[proposal_question_id]}</ErrorLabel>}
      </FormControl>
    );
  }
}

function FileEntry(props: {
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

  if (file) {
    const fileSizeMb = Math.round(file.size / 100) / 10;
    return (
      <ListItem>
        {fileInput}
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <AttachFileIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={file.name} secondary={`${fileSizeMb} MB`} />
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








interface IBasicComponentProps {
  templateField: ProposalTemplateField;
  onComplete: Function;
  touched: any;
  errors: any;
  handleChange: any;
}

export class ComponentFactory {
  private componentMap = JSDict.Create<string, any>();

  constructor() {
    this.componentMap.put(DataType.TEXT_INPUT, ProposalComponentTextInput);
    this.componentMap.put(DataType.BOOLEAN, ProposalComponentCheckBox);
    this.componentMap.put(DataType.DATE, ProposalCompontentDatePicker);
    this.componentMap.put(DataType.FILE_UPLOAD, ProposalCompontentFileUpload);
    this.componentMap.put(
      DataType.SELECTION_FROM_OPTIONS,
      ProposalComponentMultipleChoice
    );
  }

  createComponent(
    field: ProposalTemplateField,
    props: any
  ): React.ComponentElement<IBasicComponentProps, any> {
    props.templateField = field;
    props.key = field.proposal_question_id;

    let component = this.componentMap.get(field.data_type);

    return component
      ? React.createElement(component, props)
      : React.createElement(this.componentMap.get(DataType.TEXT_INPUT), props); // TMP
  }
}

export const toYupValidationSchema = (
  field: ProposalTemplateField
): Yup.Schema<any> => {
  switch (field.data_type) {
    case DataType.TEXT_INPUT:
      let txtInputSchema = Yup.string();
      field.config.required && (txtInputSchema = txtInputSchema.required(`This is a required field`));
      field.config.min && (txtInputSchema = txtInputSchema.min(field.config.min, `Value must be at least ${field.config.min} characters`));
      field.config.max && (txtInputSchema = txtInputSchema.max(field.config.max, `Value must be at most ${field.config.max} characters`));
      return txtInputSchema;
    case DataType.SELECTION_FROM_OPTIONS:
      let selectFromOptionsSchema = Yup.string();
      field.config.required && (selectFromOptionsSchema = selectFromOptionsSchema.required(`This is a required field`));
      return selectFromOptionsSchema;
    case DataType.DATE:
      let dateSchema = Yup.date();
      field.config.required && (dateSchema = dateSchema.required(`This date is required`));
      return dateSchema;
    default:
      return Yup.string();
  }
};

export const toYupInitialValues = (field: ProposalTemplateField): any => {
  return field.value;
};

export const createFormikCofigObjects = (
  fields: ProposalTemplateField[]
): { validationSchema: any; initialValues: any } => {
  let validationSchema: any = {};
  let initialValues: any = {};

  fields.forEach(field => {
    validationSchema[field.proposal_question_id] = toYupValidationSchema(field);
    initialValues[field.proposal_question_id] = toYupInitialValues(field);
  });

  return { initialValues, validationSchema };
};


export function ErrorLabel(props:any) {
  var classes = makeStyles({
    error: {
      color:"#f44336",
      fontSize:"12px",
      fontWeight:400
    }
  })();
  return <span className={classes.error}>{props.children}</span>
}
