import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import FormikUICustomDatePicker from 'components/common/FormikUICustomDatePicker';

const CallCycleInfo: React.FC = () => (
  <>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Field
        name="startNotify"
        label="Start of notification period"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
      />
      <Field
        name="endNotify"
        label="End of notification period"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
      />
      <Field
        name="startCycle"
        label="Start of cycle"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
        data-cy="start-cycle"
      />
      <Field
        name="endCycle"
        label="End of cycle"
        component={FormikUICustomDatePicker}
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
      fullWidth
      data-cy="cycle-comment"
    />
  </>
);

export default CallCycleInfo;
