import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React, { useEffect } from 'react';

import {
  CreateCallMutationVariables,
  UpdateCallMutationVariables,
} from 'generated/sdk';

const CallCycleInfo: React.FC = () => {
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startNotify, endNotify, startCycle, endCycle } = formik.values;

  useEffect(() => {
    if (endNotify && endNotify < startNotify) {
      formik.setFieldValue('endNotify', startNotify);
      formik.setFieldTouched('endNotify', false);
    }

    if (endCycle && endCycle < startCycle) {
      formik.setFieldValue('endCycle', startCycle);
      formik.setFieldTouched('endCycle', false);
    }
  }, [startNotify, endNotify, startCycle, endCycle, formik]);

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          name="startNotify"
          label="Start of notification period"
          format="yyyy-MM-dd"
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
        />
        <Field
          name="endNotify"
          label="End of notification period"
          format="yyyy-MM-dd"
          minDate={startNotify}
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
        />
        <Field
          name="startCycle"
          label="Start of cycle"
          format="yyyy-MM-dd"
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
          data-cy="start-cycle"
        />
        <Field
          name="endCycle"
          label="End of cycle"
          format="yyyy-MM-dd"
          minDate={startCycle}
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
          data-cy="end-cycle"
        />
      </MuiPickersUtilsProvider>
      <Field
        name="cycleComment"
        label="Cycle comment (public)"
        type="text"
        component={TextField}
        margin="normal"
        required
        fullWidth
        data-cy="cycle-comment"
      />
    </>
  );
};

export default CallCycleInfo;
