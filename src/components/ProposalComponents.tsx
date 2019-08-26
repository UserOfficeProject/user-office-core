import React, { ChangeEvent } from "react";
import { ProposalTemplateField, DataType } from "../model/ProposalModel";
import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, makeStyles} from "@material-ui/core";
import JSDict from "../utils/Dictionary";
import * as Yup from "yup";

export class ProposalComponentTextInput extends React.Component<IBasicComponentProps> {
  onChange(e: ChangeEvent<HTMLInputElement>) {
    this.props.templateField.value = e.target.value;
    this.props.handleChange(e); // letting Formik know that there was a change
  }

  render() {
    if (this.props.templateField === undefined) {
      return <div>loading...</div>;
    }
    let { templateField, onComplete, touched, errors } = this.props;
    return (
      <React.Fragment>
        <TextField
          id={templateField.proposal_question_id}
          name={templateField.proposal_question_id}
          fullWidth
          label={templateField.question}
          value={templateField.value}
          onChange={this.onChange.bind(this)}
          onBlur={() => onComplete()}
          error={
            touched[templateField.proposal_question_id] &&
            errors[templateField.proposal_question_id]
          }
          helperText={
            touched[templateField.proposal_question_id] &&
            errors[templateField.proposal_question_id] &&
            errors[templateField.proposal_question_id]
          }
          margin="normal"
        />
        <span>{templateField.config.small_label}</span>
      </React.Fragment>
    );
  }
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
      margin: "18px 0 0 0"
    }
  })();

  if (props.templateField === undefined) {
    return <div>loading...</div>;
  }
  let { templateField, onComplete } = props;

  return (
      <FormControl component="fieldset" className={classes.wrapper}>
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
          className={templateField.config.options.length < 3 ? classes.horizontalLayout : classes.verticalLayout}
        >
          {(templateField.config.options as string[]).map(option => {
            return (
              <FormControlLabel
                value={option}
                control={<Radio />}
                label={option}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
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
    this.componentMap.put(DataType.SMALL_TEXT, ProposalComponentTextInput);
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
      : React.createElement(this.componentMap.get(DataType.SMALL_TEXT), props); // TMP
  }
}

export const toYupValidationSchema = (
  field: ProposalTemplateField
): Yup.Schema<any> => {
  switch (field.data_type) {
    case DataType.SMALL_TEXT:
      return Yup.string()
        .min(
          field.config.min,
          `Value must be at least ${field.config.min} characters`
        )
        .max(
          field.config.max,
          `Value must be at most ${field.config.max} characters`
        );
    case DataType.SELECTION_FROM_OPTIONS:
      return Yup.string();
  }

  return Yup.string();
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
