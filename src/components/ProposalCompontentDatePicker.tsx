import React from "react";
import { FormControl } from "@material-ui/core";
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { IBasicComponentProps } from "./IBasicComponentProps";
import { Field } from "formik";
export function ProposalCompontentDatePicker(props: IBasicComponentProps) {
  const { templateField, onComplete, touched, errors } = props;
  const { proposal_question_id, config, question } = templateField;
  const isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;
  if (!templateField.value) {
    templateField.value = new Date();
  }

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          name={proposal_question_id}
          label={question}
          component={
            ({ field, form, ...other }:{field:any, form:any}) => {
              const currentError = form.errors[field.name];
              return (
                <KeyboardDatePicker
                  error={isError}
                  name={field.name}
                  value={field.value}
                  format="dd/MMM/yyyy"
                  helperText={currentError}
                  label={question}
                  onChange={
                    date => {
                      templateField.value = date;
                      form.setFieldValue(field.name, date, false);
                      onComplete();
                    }
                  }
                  {...other}
                />
              );
            }
          }
        />
      </MuiPickersUtilsProvider>
      <span>{config.small_label}</span>
    </FormControl>
  );
}
