import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React from 'react';

const CallReviewAndNotification: React.FC = () => (
  <>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Field
        name="startReview"
        label="Start of review"
        format="yyyy-MM-dd"
        component={KeyboardDatePicker}
        margin="normal"
        fullWidth
        data-cy="start-review"
      />
      <Field
        name="endReview"
        label="End of review"
        format="yyyy-MM-dd"
        component={KeyboardDatePicker}
        margin="normal"
        fullWidth
      />
      <Field
        name="startSEPReview"
        label="Start of SEP review"
        format="yyyy-MM-dd"
        component={KeyboardDatePicker}
        margin="normal"
        fullWidth
      />
      <Field
        name="endSEPReview"
        label="End of SEP review"
        format="yyyy-MM-dd"
        component={KeyboardDatePicker}
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
      required
      data-cy="survey-comment"
    />
  </>
);

export default CallReviewAndNotification;
