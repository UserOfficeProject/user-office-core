import React, { ChangeEvent } from "react";
import { ProposalTemplateField } from "../model/ProposalModel";
import { TextField } from "@material-ui/core";
import JSDict from "../utils/Dictionary";

export class ProposalComponentTextInput extends React.Component<IBasicComponentProps> 
{

  handleChange(e: ChangeEvent<HTMLInputElement>) {
    this.props.templateField.value = e.target.value;
    this.setState({});
  }

  render() {
    if (this.props.templateField === undefined) {
      return <div>loading...</div>;
    }
    return (
      <div className="baseComponent">
        <TextField id="standard-name" 
              fullWidth 
              label={this.props.templateField.config.topic} 
              value={this.props.templateField.value} 
              onChange={this.handleChange.bind(this)} 
              onBlur={() => this.props.onComplete()} 
              margin="normal" />
      </div>
    );
  }
}

interface IBasicComponentProps {
  templateField: ProposalTemplateField; 
  onComplete: Function;
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