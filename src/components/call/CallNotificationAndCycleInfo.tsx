import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React from 'react';

const CallCycleInfo: React.FC = () => (
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

export default CallCycleInfo;
