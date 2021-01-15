import DateFnsUtils from '@date-io/date-fns';
import FormControl from '@material-ui/core/FormControl';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Field, getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateConfig } from 'generated/sdk';

function TextFieldWithTooltip({
  title,
  ...props
}: TextFieldProps & { title: string }) {
  return (
    <Tooltip title={title}>
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
    <FormControl error={isError} margin="dense">
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          data-cy={proposalQuestionId + '_field'}
          name={proposalQuestionId}
          label={
            <>
              {question}
              {config.small_label && (
                <>
                  <br />
                  <small>{config.small_label}</small>
                </>
              )}
            </>
          }
          component={({ field, form, ...other }: { field: any; form: any }) => {
            return (
              <KeyboardDatePicker
                required={config.required}
                clearable={true}
                error={isError}
                name={field.name}
                helperText={isError && fieldError}
                value={stateValue}
                format="yyyy-MM-dd"
                onChange={date => {
                  setStateValue(date);
                  onComplete(date);
                  form.setFieldValue(field.name, date, false);
                }}
                TextFieldComponent={props => (
                  <TextFieldWithTooltip {...props} title={config.tooltip} />
                )}
                {...other}
              />
            );
          }}
        />
      </MuiPickersUtilsProvider>
    </FormControl>
  );
}
