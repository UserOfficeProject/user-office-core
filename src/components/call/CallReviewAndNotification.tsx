import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import FormikUICustomDatePicker from '../common/FormikUICustomDatePicker';

const CallReviewAndNotification: React.FC = () => (
  <>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Field
        name="startReview"
        label="Start of review"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
        data-cy="start-review"
      />
      <Field
        name="endReview"
        label="End of review"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
      />
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
    </MuiPickersUtilsProvider>
    <Field
      name="surveyComment"
      label="Survey Comment"
      type="text"
      component={TextField}
      margin="normal"
      fullWidth
      data-cy="survey-comment"
    />
  </>
);

export default CallReviewAndNotification;
