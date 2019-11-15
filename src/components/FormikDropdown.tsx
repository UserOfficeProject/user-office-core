import React from "react";
import { TextField } from "formik-material-ui";
import { MenuItem } from "@material-ui/core";
import { Field } from "formik";

class FormikDropdown extends React.Component<TProps> {
  render() {
    return (
      <Field
        type="text"
        name={this.props.name}
        label={this.props.label}
        select
        margin="normal"
        component={TextField}
        InputLabelProps={{
          shrink: true
        }}
        fullWidth
        required={this.props.required}
        disabled={this.props.disabled}
      >
        {this.props.children}
        {this.props.items.map(option => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.text}
            </MenuItem>
          );
        })}
      </Field>
    );
  }
}

interface TProps {
  items: Option[];
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

interface Option {
  text: string;
  value: string;
}

export default FormikDropdown;
