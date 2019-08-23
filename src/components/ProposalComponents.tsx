import React, { ChangeEvent } from "react";
import { ProposalTemplateField } from "../model/ProposalModel";
import { TextField } from "@material-ui/core";
import JSDict from "../utils/Dictionary";
import * as Yup from "yup";

export class ProposalComponentTextInput extends React.Component<IBasicComponentProps> 
{

  onChange(e: ChangeEvent<HTMLInputElement>) {
    this.props.templateField.value = e.target.value;
    this.props.handleChange(e); // letting Formik know that there was a change
  }

  render() {
    if (this.props.templateField === undefined) {
      return <div>loading...</div>;
    }
    let {templateField, onComplete, touched, errors} = this.props;
    return (
      <div className="baseComponent">
        
        <TextField id={templateField.proposal_question_id} 
              name={templateField.proposal_question_id}
              fullWidth 
              label={templateField.question} 
              value={templateField.value} 
              onChange={this.onChange.bind(this)} 
              onBlur={() => onComplete()} 
              // @ts-ignore: Formik does not know that this is available
              error={touched[templateField.proposal_question_id] && errors[templateField.proposal_question_id]} 
              // @ts-ignore: Formik does not know that this is available
              helperText={touched[templateField.proposal_question_id] && errors[templateField.proposal_question_id] && errors[templateField.proposal_question_id]}
              margin="normal" />
        <span>{templateField.config.small_label}</span>
      </div>
    );
  }
}

interface IBasicComponentProps {
  templateField: ProposalTemplateField; 
  onComplete: Function;
  touched:any;
  errors:any;
  handleChange:any;
}


export class ComponentFactory {
  private componentMap = JSDict.Create<string, any>();

  constructor() {
    this.componentMap.put("SMALL_TEXT", ProposalComponentTextInput);
  }

  createComponent( field: ProposalTemplateField, props: any ): React.ComponentElement<IBasicComponentProps, any> {
    props.templateField = field;
    props.key = field.proposal_question_id;

    // return React.createElement(this.componentMap.get(node.data_type.toString()), props);
    return React.createElement(this.componentMap.get("SMALL_TEXT"), props); // WIP returing TextInputComponent until other components are made
  }
}


export const toYupValidationSchema = (field:ProposalTemplateField):Yup.Schema<any> => {
  //switch(field.data_type) {
    //case DataType.SMALL_TEXT:
        return Yup.string()
          .min(field.config.min, `Value must be at least ${field.config.min} characters`)
          .max(field.config.max, `Value must be at most ${field.config.max} characters`)
  //}
}


export const toYupInitialValues = (field:ProposalTemplateField):any => {
        return field.value;
}

export const createFormikCofigObjects = (fields:ProposalTemplateField[]):{validationSchema:any, initialValues:any} =>  {
  let validationSchema:any = {};
  let initialValues:any = {};

  fields.forEach(field => {
    validationSchema[field.proposal_question_id] = toYupValidationSchema(field);
    initialValues[field.proposal_question_id] = toYupInitialValues(field);
  });
          
  return { initialValues, validationSchema };
}
