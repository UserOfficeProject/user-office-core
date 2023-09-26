import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import i18n from 'i18n';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  CreateCallMutationVariables,
  SettingsId,
  UpdateCallMutationVariables,
  UserRole,
} from 'generated/sdk';
import { useSEPsData } from 'hooks/SEP/useSEPsData';

const CallReviewAndNotification = () => {
  const theme = useTheme();
  const { currentRole } = useContext(UserContext);
  const { SEPs: allActiveSeps, loadingSEPs } = useSEPsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });
  const { settingsMap } = useContext(SettingsContext);
  const dateFormat = settingsMap.get(SettingsId.DATE_FORMAT)?.settingsValue;
  const mask = dateFormat?.replace(/[a-zA-Z]/g, '_');
  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startReview, startSEPReview } = formik.values;
  const { t } = useTranslation();

  const sepOptions =
    allActiveSeps?.map((sep) => ({
      text: sep.code,
      value: sep.id,
    })) || [];

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
          label={'Start of ' + t('SEP') + ' review'}
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
          label={'End of ' + t('SEP') + ' review'}
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
      <FormikUIAutocomplete
        name="seps"
        label={'Call ' + i18n.format(t('SEP'), 'plural')}
        multiple
        loading={loadingSEPs}
        noOptionsText="No SEPs"
        data-cy="call-seps"
        items={sepOptions}
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
