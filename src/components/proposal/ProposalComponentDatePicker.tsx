import DateFnsUtils from '@date-io/date-fns';
import { FormControl, Tooltip } from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Field, getIn } from 'formik';
import React, { useState, useEffect } from 'react';

import { IBasicComponentProps } from './IBasicComponentProps';

export function ProposalComponentDatePicker(props: IBasicComponentProps) {
  const { templateField, touched, errors, onComplete } = props;
  const { proposal_question_id, config, question, value } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const [stateValue, setStateValue] = useState(value || '');

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          data-cy={proposal_question_id + '_field'}
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
                    onComplete(null as any, date); // There is no event in the callback for DatePicker :( We, therefore, send null as event and inform Formik through setFieldValue
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
