import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomDatePicker from 'components/common/FormikUICustomDatePicker';
import { useProposalsTemplates } from 'hooks/template/useProposalTemplates';

const CallGeneralInfo: React.FC = () => {
  const { templates } = useProposalsTemplates(false);

  return (
    <>
      <Field
        name="shortCode"
        label="Short Code"
        type="text"
        component={TextField}
        margin="normal"
        fullWidth
        data-cy="short-code"
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          name="startCall"
          label="Start"
          component={FormikUICustomDatePicker}
          margin="normal"
          fullWidth
          data-cy="start-date"
        />

        <Field
          name="endCall"
          label="End"
          component={FormikUICustomDatePicker}
          margin="normal"
          fullWidth
          data-cy="end-date"
        />
      </MuiPickersUtilsProvider>
      {templates && templates.length > 0 && (
        <FormikDropdown
          name="templateId"
          label="Call template"
          items={templates.map(template => ({
            text: template.name,
            value: template.templateId,
          }))}
          InputProps={{ 'data-cy': 'call-template' }}
        />
      )}
    </>
  );
};

export default CallGeneralInfo;
