import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomDatePicker from 'components/common/FormikUICustomDatePicker';
import { useProposalWorkflowsData } from 'hooks/settings/useProposalWorkflowsData';
import { useProposalsTemplates } from 'hooks/template/useProposalTemplates';

const CallGeneralInfo: React.FC = () => {
  const { templates, loadingTemplates } = useProposalsTemplates(false);
  const {
    proposalWorkflows,
    loadingProposalWorkflows,
  } = useProposalWorkflowsData();

  const proposalWorkflowsWithInjectedSelectionRemoval = [
    { id: '', name: 'None (remove selection)' },
    ...proposalWorkflows,
  ].map(proposalWorkflow => ({
    text: proposalWorkflow.name,
    value: proposalWorkflow.id,
  }));

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
      <FormikDropdown
        name="templateId"
        label="Call template"
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={templates.map(template => ({
          text: template.name,
          value: template.templateId,
        }))}
        data-cy="call-template"
      />
      <FormikDropdown
        name="proposalWorkflowId"
        label="Proposal workflow"
        loading={loadingProposalWorkflows}
        noOptionsText="No proposal workflows"
        items={
          proposalWorkflows.length > 0
            ? proposalWorkflowsWithInjectedSelectionRemoval
            : []
        }
        data-cy="call-workflow"
      />
    </>
  );
};

export default CallGeneralInfo;
