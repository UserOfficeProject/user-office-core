import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import {
  CreateCallMutationVariables,
  GetProposalTemplatesQuery,
  ProposalWorkflow,
  UpdateCallMutationVariables,
} from 'generated/sdk';

export enum AllocationTimeUnits {
  Days = 'DAYS',
  Hours = 'HOURS',
}

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
  const proposalWorkflowsWithInjectedSelectionRemoval = proposalWorkflows.map(
    (proposalWorkflow) => ({
      text: proposalWorkflow.name,
      value: proposalWorkflow.id,
    })
  );

  const allocationTimeUnitOptions = Object.keys(AllocationTimeUnits).map(
    (key) => ({
      text: key,
      value: AllocationTimeUnits[key as keyof typeof AllocationTimeUnits],
    })
  );

  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startCall, endCall } = formik.values;

  useEffect(() => {
    if (endCall && endCall < startCall) {
      formik.setFieldValue('endCall', startCall);
      /** NOTE: Set field untouched because if we try to update the endCall before startCall and then
       *  set startCall after endCall it can show error message even though we update the endCall automatically.
       */
      formik.setFieldTouched('endCall', false);
    }
  }, [startCall, endCall, formik]);

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
          minDate={startCall}
          required
          data-cy="end-date"
        />
        <Field
          name="referenceNumberFormat"
          label="Reference number format"
          type="text"
          component={TextField}
          margin="normal"
          fullWidth
          data-cy="reference-number-format"
        />
      </MuiPickersUtilsProvider>
      <FormikDropdown
        name="templateId"
        label="Call template"
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={templates.map((template) => ({
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
        InputProps={{
          'data-cy': 'call-workflow',
        }}
        isClearable
      />
      <FormikDropdown
        name="allocationTimeUnit"
        label="Allocation time unit"
        items={allocationTimeUnitOptions}
        InputProps={{ 'data-cy': 'allocation-time-unit' }}
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
