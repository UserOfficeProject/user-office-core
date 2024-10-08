import useTheme from '@mui/material/styles/useTheme';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import DatePicker from 'components/common/FormikUIDatePicker';
import TextField from 'components/common/FormikUITextField';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  CreateCallMutationVariables,
  SettingsId,
  UpdateCallMutationVariables,
  UserRole,
} from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';

const CallReviewAndNotification = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentRole } = useContext(UserContext);
  const { faps: allActiveFaps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });
  const { settingsMap } = useContext(SettingsContext);
  const dateFormat = settingsMap.get(SettingsId.DATE_FORMAT)?.settingsValue;
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startReview, startFapReview } = formik.values;

  const fapOptions =
    allActiveFaps?.map((fap) => ({
      text: fap.code,
      value: fap.id,
    })) || [];

  return (
    <>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startReview"
          label="Start of review"
          id="start-review-input"
          format={dateFormat}
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
          format={dateFormat}
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
          name="startFapReview"
          label={t('Start of Fap review')}
          id="start-fap-review-input"
          format={dateFormat}
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
          name="endFapReview"
          label={t('End of Fap review')}
          id="end-fap-review-input"
          format={dateFormat}
          ampm={false}
          allowSameDateSelection
          minDate={startFapReview}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          textField={{
            fullWidth: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
      </LocalizationProvider>
      <FormikUIAutocomplete
        name="faps"
        label="Call FAPs"
        multiple
        loading={loadingFaps}
        noOptionsText="No Faps"
        data-cy="call-faps"
        items={fapOptions}
      />
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
