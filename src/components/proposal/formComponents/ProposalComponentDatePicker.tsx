import DateFnsUtils from '@date-io/date-fns';
import { FormControl, Tooltip } from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Field, getIn } from 'formik';
import React, { useState, useEffect } from 'react';

import { BasicComponentProps } from '../IBasicComponentProps';

export function ProposalComponentDatePicker(props: BasicComponentProps) {
  const { templateField, touched, errors, onComplete } = props;
  const {
    question: { proposalQuestionId, question },
    config,
    value,
  } = templateField;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const [stateValue, setStateValue] = useState(value || '');

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          data-cy={proposalQuestionId + '_field'}
          name={proposalQuestionId}
          label={question}
          component={({ field, form, ...other }: { field: any; form: any }) => {
            return (
              <Tooltip title={config.tooltip}>
                <KeyboardDatePicker
                  required={config.required ? true : false}
                  clearable={true}
                  error={isError}
                  name={field.name}
                  helperText={isError && errors[proposalQuestionId]}
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
