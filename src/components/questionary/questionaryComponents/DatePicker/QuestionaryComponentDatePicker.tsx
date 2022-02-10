import DateFnsUtils from '@date-io/date-fns';
import { DateType } from '@date-io/type';
import FormControl from '@material-ui/core/FormControl';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Field } from 'formik';
import {
  KeyboardDatePicker,
  KeyboardDateTimePicker,
} from 'formik-material-ui-pickers';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateConfig } from 'generated/sdk';

import Hint from '../Hint';

export function QuestionaryComponentDatePicker(props: BasicComponentProps) {
  const { answer, onComplete } = props;
  const {
    question: { id, question },
  } = answer;
  const { tooltip, required } = answer.config as DateConfig;

  const dateFormat = 'yyyy-MM-dd';
  const timeFormat = `${dateFormat} HH:mm`;

  const getDateField = () => (
    <Field
      required={required}
      data-cy={`${id}.value`}
      id={`${id}-id`}
      name={id}
      label={question}
      format={dateFormat}
      component={KeyboardDatePicker}
      variant="inline"
      disableToolbar
      autoOk={true}
      onChange={(date: MaterialUiPickersDate) => {
        /*
        DateFnsUtils correct type is Date | null, but use of Luxon elsewhere (in call modal)
        causes incorrect type inference: https://github.com/dmtrKovalenko/date-io/issues/584
        */
        const newDate = date as unknown as Date;
        newDate?.setHours(0, 0, 0, 0); // omit time
        onComplete(newDate);
      }}
    />
  );

  const getDateTimeField = () => (
    <>
      <Field
        required={required}
        data-cy={`${id}.value`}
        id={`${id}-id`}
        name={id}
        label={question}
        format={timeFormat}
        component={KeyboardDateTimePicker}
        onChange={(date: DateType | null) => {
          onComplete(date);
        }}
      />
    </>
  );

  return (
    <FormControl margin="dense">
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {(answer.config as DateConfig).includeTime
          ? getDateTimeField()
          : getDateField()}
      </MuiPickersUtilsProvider>
      <Hint>{tooltip}</Hint>
    </FormControl>
  );
}
