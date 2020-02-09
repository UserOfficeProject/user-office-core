import React, { useContext, useState } from "react";
import { FormControl, Tooltip } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { Field } from "formik";
import { getIn } from "formik";
import { EventType } from "../models/ProposalSubmissionModel";
import { ProposalSubmissionContext } from "./ProposalContainer";

export function ProposalComponentDatePicker(props: IBasicComponentProps) {
  let { templateField, touched, errors } = props;
  const { proposal_question_id, config, question, value } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const { dispatch } = useContext(ProposalSubmissionContext);
  const [stateValue, setStateValue] = useState(value || "");

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          data-cy={proposal_question_id + "_field"}
          name={proposal_question_id}
          label={question}
          component={({ field, form, ...other }: { field: any; form: any }) => {
            return (
              <Tooltip title={config.tooltip}>
                <KeyboardDatePicker
                  required={config.required ? true : false}
                  clearable={true}
                  error={isError}
                  name={field.name}
                  helperText={isError && errors[proposal_question_id]}
                  label={question}
                  value={stateValue}
                  format="yyyy-MM-dd"
                  onChange={date => {
                    setStateValue(date);
                    dispatch({
                      type: EventType.FIELD_CHANGED,
                      payload: {
                        id: proposal_question_id,
                        newValue: date
                      }
                    });
                    form.setFieldValue(field.name, date, false);
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
