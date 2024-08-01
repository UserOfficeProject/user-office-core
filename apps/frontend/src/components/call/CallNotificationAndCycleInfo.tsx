import useTheme from '@mui/material/styles/useTheme';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field, useFormikContext } from 'formik';
import React, { useContext } from 'react';

import DatePicker from 'components/common/FormikUIDatePicker';
import TextField from 'components/common/FormikUITextField';
import { SettingsContext } from 'context/SettingsContextProvider';
import {
  CreateCallMutationVariables,
  SettingsId,
  UpdateCallMutationVariables,
} from 'generated/sdk';

const CallCycleInfo = () => {
  const theme = useTheme();
  const { settingsMap } = useContext(SettingsContext);
  const dateFormat = settingsMap.get(SettingsId.DATE_FORMAT)?.settingsValue;

  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startNotify, startCycle } = formik.values;

  return (
    <>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startNotify"
          label="Start of notification period"
          id="start-notification-period-input"
          format={dateFormat}
          ampm={false}
          allowSameDateSelection
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          textField={{
            fullWidth: true,
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="endNotify"
          label="End of notification period"
          id="end-notification-period-input"
          format={dateFormat}
          ampm={false}
          minDate={startNotify}
          allowSameDateSelection
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          textField={{
            fullWidth: true,
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="startCycle"
          label="Start of cycle"
          id="start-cycle-input"
          format={dateFormat}
          ampm={false}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            'data-cy': 'start-cycle',
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="endCycle"
          label="End of cycle"
          id="end-cycle-input"
          format={dateFormat}
          ampm={false}
          minDate={startCycle}
          component={DatePicker}
          inputProps={{ placeholder: dateFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            'data-cy': 'end-cycle',
            required: true,
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
      </LocalizationProvider>
      <Field
        name="cycleComment"
        label="Cycle comment (public)"
        id="cycle-comment-input"
        type="text"
        component={TextField}
        required
        fullWidth
        data-cy="cycle-comment"
        inputProps={{ maxLength: '100' }}
      />
      <Field
        name="submissionMessage"
        label="Submission Message"
        id="submission-message-input"
        type="text"
        component={TextField}
        fullWidth
        data-cy="submission-message"
      />
    </>
  );
};

export default CallCycleInfo;
