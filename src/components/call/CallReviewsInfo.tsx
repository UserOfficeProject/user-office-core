import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import React, { useEffect } from 'react';

import {
  CreateCallMutationVariables,
  UpdateCallMutationVariables,
} from 'generated/sdk';

const CallReviewAndNotification: React.FC = () => {
  const theme = useTheme();
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startReview, endReview, startSEPReview, endSEPReview } =
    formik.values;

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
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startReview"
          label="Start of review"
          id="start-review-input"
          inputFormat="yyyy-MM-dd"
          component={DatePicker}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            'data-cy': 'start-review',
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
        <Field
          name="endReview"
          label="End of review"
          id="end-review-input"
          inputFormat="yyyy-MM-dd"
          minDate={startReview}
          component={DatePicker}
          allowSameDateSelection
          textField={{
            fullWidth: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
        <Field
          name="startSEPReview"
          label="Start of SEP review"
          id="start-sep-review-input"
          inputFormat="yyyy-MM-dd"
          allowSameDateSelection
          component={DatePicker}
          textField={{
            fullWidth: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
        <Field
          name="endSEPReview"
          label="End of SEP review"
          id="end-sep-review-input"
          inputFormat="yyyy-MM-dd"
          allowSameDateSelection
          minDate={endSEPReview}
          component={DatePicker}
          textField={{
            fullWidth: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
      </LocalizationProvider>
      <Field
        name="surveyComment"
        label="Survey Comment"
        id="survey-comment-input"
        type="text"
        component={TextField}
        fullWidth
        required
        inputProps={{ maxLength: '100' }}
        data-cy="survey-comment"
      />
    </>
  );
};

export default CallReviewAndNotification;
