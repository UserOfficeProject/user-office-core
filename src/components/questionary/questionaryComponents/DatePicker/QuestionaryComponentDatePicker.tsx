import DateFnsUtils from '@date-io/date-fns';
import { TextField, TextFieldProps } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Field, getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { DateConfig } from 'generated/sdk';

import { BasicComponentProps } from '../../../proposal/IBasicComponentProps';

function TextFieldWithTooltip(props: TextFieldProps & { title: string }) {
  return (
    <Tooltip title={props.title}>
      <TextField {...props} />
    </Tooltip>
  );
}

export function QuestionaryComponentDatePicker(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { proposalQuestionId, question },
    value,
  } = answer;
  const config = answer.config as DateConfig;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const [stateValue, setStateValue] = useState(value || '');

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  return (
    <FormControl error={isError}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          data-cy={proposalQuestionId + '_field'}
          name={proposalQuestionId}
          label={question}
          component={({ field, form, ...other }: { field: any; form: any }) => {
            return (
              <KeyboardDatePicker
                required={config.required ? true : false}
                clearable={true}
                error={isError}
                name={field.name}
                helperText={isError && errors[proposalQuestionId]}
                label={question}
                value={stateValue}
                format="yyyy-MM-dd"
                title={config.tooltip} // title prop will be passed down to TextFieldWithTooltip by KeyboardDatePicker
                onChange={date => {
                  setStateValue(date);
                  onComplete(null as any, date); // There is no event in the callback for DatePicker :( We, therefore, send null as event and inform Formik through setFieldValue
                  form.setFieldValue(field.name, date, false);
                }}
                // @ts-ignore-line // https://material-ui-pickers.dev/api/KeyboardDatePicker Any prop not recognized by the pickers and their sub-components are passed down to material-ui TextField component.
                TextFieldComponent={TextFieldWithTooltip}
                {...other}
              />
            );
          }}
        />
      </MuiPickersUtilsProvider>
      <span>{config.small_label}</span>
    </FormControl>
  );
}
