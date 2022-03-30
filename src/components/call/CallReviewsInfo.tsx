import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import React, { useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import {
  CreateCallMutationVariables,
  SettingsId,
  UpdateCallMutationVariables,
} from 'generated/sdk';

const CallReviewAndNotification: React.FC = () => {
  const theme = useTheme();
  const { settings } = useContext(SettingsContext);
  const dateFormat = settings.get(SettingsId.DATE_FORMAT)?.settingsValue;
  const mask = dateFormat?.replace(/[a-zA-Z]/g, '_');
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startReview, startSEPReview } = formik.values;

  return (
    <>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startReview"
          label="Start of review"
          id="start-review-input"
          inputFormat={dateFormat}
          mask={mask}
          ampm={false}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            'data-cy': 'start-review',
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="endReview"
          label="End of review"
          id="end-review-input"
          inputFormat={dateFormat}
          mask={mask}
          ampm={false}
          minDate={startReview}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="startSEPReview"
          label="Start of SEP review"
          id="start-sep-review-input"
          inputFormat={dateFormat}
          mask={mask}
          ampm={false}
          allowSameDateSelection
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          textField={{
            fullWidth: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
        <Field
          name="endSEPReview"
          label="End of SEP review"
          id="end-sep-review-input"
          inputFormat={dateFormat}
          mask={mask}
          ampm={false}
          allowSameDateSelection
          minDate={startSEPReview}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
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
