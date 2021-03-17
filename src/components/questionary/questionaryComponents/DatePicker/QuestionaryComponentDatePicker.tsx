import DateFnsUtils from '@date-io/date-fns';
import { DateType } from '@date-io/type';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Field, getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateConfig } from 'generated/sdk';

const TooltipWrapper = ({
  children,
  title,
}: {
  title?: string;
  children: React.ReactElement;
}) => {
  if (!title) {
    return children;
  }

  return <Tooltip title={title}>{children}</Tooltip>;
};

export function QuestionaryComponentDatePicker(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched, setFieldValue, values },
  } = props;
  const {
    question: { id, question },
    answerId,
  } = answer;
  const {
    defaultDate,
    tooltip,
    minDate,
    maxDate,
    small_label: smallLabel,
    required,
  } = answer.config as DateConfig;
  const fieldError = getIn(errors, id);
  const fieldValue = getIn(values, id);
  const isError = getIn(touched, id) && !!fieldError;
  const [defaultInitialized, setDefaultInitialized] = useState(false);

  // set default value only when creating new proposal,
  // the user will either change it or keep it in the next step
  // which will explicitly set the value of the field
  // and we won't need to use the default value any longer
  useEffect(() => {
    if (answerId === null && defaultDate && !defaultInitialized) {
      onComplete(defaultDate);
      setFieldValue(id, defaultDate, false);
      setDefaultInitialized(true);
    }
  }, [
    defaultInitialized,
    id,
    answerId,
    defaultDate,
    onComplete,
    setFieldValue,
  ]);

  return (
    <TooltipWrapper title={tooltip}>
      <FormControl error={isError} margin="dense">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Field
            required={required}
            error={isError}
            helperText={isError && fieldError}
            data-cy={`${id}.value`}
            name={id}
            label={
              <>
                {question}
                {smallLabel && (
                  <>
                    <br />
                    <small>{smallLabel}</small>
                  </>
                )}
              </>
            }
            value={fieldValue || null} // date picker requires null for empty value
            format="yyyy-MM-dd"
            component={KeyboardDatePicker}
            variant="inline"
            disableToolbar
            autoOk={true}
            onChange={(date: DateType | null) => {
              date?.setUTCHours(0, 0, 0, 0); // omit time
              onComplete(date);
              setFieldValue(id, date, false);
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
        </MuiPickersUtilsProvider>
      </FormControl>
    </TooltipWrapper>
  );
}
