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

const CallReviewAndNotification: React.FC = () => {
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const {
    startReview,
    endReview,
    startSEPReview,
    endSEPReview,
  } = formik.values;

  useEffect(() => {
    if (endReview && endReview < startReview) {
      formik.setFieldValue('endReview', startReview);
      formik.setFieldTouched('endReview', false);
    }

    if (endSEPReview && endSEPReview < startSEPReview) {
      formik.setFieldValue('endSEPReview', startSEPReview);
      formik.setFieldTouched('endSEPReview', false);
    }
  }, [startReview, endReview, startSEPReview, endSEPReview, formik]);

  return (
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
          minDate={startReview}
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
          minDate={endSEPReview}
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
};

export default CallReviewAndNotification;
