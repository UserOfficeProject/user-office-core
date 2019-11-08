import React from "react";
import { FormControl, Tooltip } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { Field } from "formik";
import { getIn } from "formik";
export function ProposalCompontentDatePicker(props: IBasicComponentProps) {
  let { templateField, onComplete, touched, errors } = props;
  const { proposal_question_id, config, question } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          name={proposal_question_id}
          label={question}
          component={({ field, form, ...other }: { field: any; form: any }) => {
            return (
              <Tooltip title={config.tooltip}>
                <KeyboardDatePicker
                  clearable={true}
                  error={isError}
                  name={field.name}
                  value={field.value || ""}
                  format="dd/MMM/yyyy"
                  helperText={isError && errors[proposal_question_id]}
                  label={question}
                  onChange={date => {
                    templateField.value = date;
                    form.setFieldValue(field.name, date, false);
                    onComplete();
                  }}
                  {...other}
                />
              </Tooltip>
            );
          }}
        />
      </MuiPickersUtilsProvider>
      <span>{config.small_label}</span>
    </FormControl>
  );
}
