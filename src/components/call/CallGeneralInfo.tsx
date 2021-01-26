import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import PropTypes from 'prop-types';
import React from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import { GetProposalTemplatesQuery, ProposalWorkflow } from 'generated/sdk';

const CallGeneralInfo: React.FC<{
  templates: Exclude<GetProposalTemplatesQuery['proposalTemplates'], null>;
  loadingTemplates: boolean;
  proposalWorkflows: ProposalWorkflow[];
  loadingProposalWorkflows: boolean;
}> = ({
  loadingProposalWorkflows,
  proposalWorkflows,
  loadingTemplates,
  templates,
}) => {
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
        required
        data-cy="short-code"
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Field
          name="startCall"
          label="Start"
          format="yyyy-MM-dd"
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
          required
          data-cy="start-date"
        />

        <Field
          name="endCall"
          label="End"
          format="yyyy-MM-dd"
          component={KeyboardDatePicker}
          margin="normal"
          fullWidth
          required
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
        InputProps={{ 'data-cy': 'call-template' }}
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
        InputProps={{ 'data-cy': 'call-workflow' }}
      />
    </>
  );
};

CallGeneralInfo.propTypes = {
  loadingProposalWorkflows: PropTypes.bool.isRequired,
  proposalWorkflows: PropTypes.array.isRequired,
  loadingTemplates: PropTypes.bool.isRequired,
  templates: PropTypes.array.isRequired,
};

export default CallGeneralInfo;
