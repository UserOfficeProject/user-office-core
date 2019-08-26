import React, { ChangeEvent } from "react";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, makeStyles, Checkbox, InputLabel, Select, MenuItem } from "@material-ui/core";
import JSDict from "../utils/Dictionary";
import * as Yup from "yup";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

export function ProposalComponentTextInput(props:IBasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin:"15px 0 10px 0"
    }
  })();

  let { templateField, onComplete, touched, errors } = props;

    return (
      <div>
        <TextField
          id={templateField.proposal_question_id}
          name={templateField.proposal_question_id}
          fullWidth
          label={templateField.question}
          value={templateField.value}
          onChange={(evt: ChangeEvent<HTMLInputElement>) => {
            props.templateField.value = evt.target.value;
            props.handleChange(evt); // letting Formik know that there was a change
          }}
          onBlur={() => onComplete()}
          placeholder={templateField.config.small_label}
          error={
            touched[templateField.proposal_question_id] &&
            errors[templateField.proposal_question_id]
          }
          helperText={
            errors[templateField.proposal_question_id]
          }
          multiline={templateField.config.multiline}
          rows={templateField.config.multiline?4:1}
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

  let { templateField, onComplete, touched, errors } = props;

  switch (templateField.config.variant) {
    case "dropdown":
      return (
        <FormControl className={classes.wrapper}>
          <InputLabel htmlFor={templateField.proposal_question_id} shrink>
            {templateField.question}
          </InputLabel>
          <Select
            id={templateField.proposal_question_id}
            name={templateField.proposal_question_id}
            value={templateField.value}
            onChange={evt => {
              props.templateField.value = (evt.target as HTMLInputElement).value;
              props.handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
          >
            {(templateField.config.options as string[]).map(option => {
              return <MenuItem value={option} key={option}>{option}</MenuItem>;
            })}
          </Select>
          {touched[templateField.proposal_question_id] && <ErrorLabel>{errors[templateField.proposal_question_id]}</ErrorLabel>}
        </FormControl>
      );
    default:
      return (
        <FormControl component="fieldset" className={classes.wrapper + touched[templateField.proposal_question_id] && "error"}>
          <FormLabel component="legend">{templateField.question}</FormLabel>
          <span>{templateField.config.small_label}</span>
          <RadioGroup
            id={templateField.proposal_question_id}
            name={templateField.proposal_question_id}
            onChange={evt => {
              props.templateField.value = (evt.target as HTMLInputElement).value;
              props.handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            className={
              templateField.config.options.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {(templateField.config.options as string[]).map(option => {
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
          {touched[templateField.proposal_question_id] && <ErrorLabel>{errors[templateField.proposal_question_id]}</ErrorLabel>}
        </FormControl>
      );
  }
}



export function ProposalComponentCheckBox(props: IBasicComponentProps) {
  let { templateField, onComplete, touched, errors } = props;

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            id={templateField.proposal_question_id}
            name={templateField.proposal_question_id}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              props.templateField.value = evt.target.checked;
              props.handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
          />
        }
        label={templateField.question}
      />
      <span>{templateField.config.small_label}</span>
      {touched[templateField.proposal_question_id] && <ErrorLabel>{errors[templateField.proposal_question_id]}</ErrorLabel>}
    </div>
  );
}



export function ProposalCompontentDatePicker(props: IBasicComponentProps)
{
  let { templateField, onComplete, touched, errors } = props;
  if(!templateField.value) {
    templateField.value = new Date();
  }
  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="dd/MMM/yyyy"
          id={templateField.proposal_question_id}
          name={templateField.proposal_question_id}
          label={templateField.question}
          value={templateField.value}
          onChange={(date, val) => {
            props.templateField.value = val;
            props.handleChange(val); // letting Formik know that there was a change;
            onComplete();
          }}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        </MuiPickersUtilsProvider>
      <span>{templateField.config.small_label}</span>
      {touched[templateField.proposal_question_id] && <ErrorLabel>{errors[templateField.proposal_question_id]}</ErrorLabel>}
    </div>
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
