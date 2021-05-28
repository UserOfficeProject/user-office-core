import DateFnsUtils from '@date-io/date-fns';
import { DateType } from '@date-io/type';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React from 'react';

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
  const { answer, onComplete } = props;
  const {
    question: { id, question },
  } = answer;
  const { tooltip, required } = answer.config as DateConfig;

  return (
    <TooltipWrapper title={tooltip}>
      <FormControl margin="dense" fullWidth>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Field
            required={required}
            data-cy={`${id}.value`}
            name={id}
            label={question}
            format="yyyy-MM-dd"
            component={KeyboardDatePicker}
            variant="inline"
            disableToolbar
            autoOk={true}
            onChange={(date: DateType | null) => {
              date?.setUTCHours(0, 0, 0, 0); // omit time
              onComplete(date);
            }}
          />
        </MuiPickersUtilsProvider>
      </FormControl>
    </TooltipWrapper>
  );
}
