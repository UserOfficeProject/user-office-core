import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import FormikUICustomDatePicker from 'components/common/FormikUICustomDatePicker';

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
        name="startSEPReview"
        label="Start of SEP review"
        component={FormikUICustomDatePicker}
        margin="normal"
        fullWidth
      />
      <Field
        name="endSEPReview"
        label="End of SEP review"
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
