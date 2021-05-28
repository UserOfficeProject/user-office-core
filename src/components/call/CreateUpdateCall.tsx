import {
  createCallValidationSchemas,
  updateCallValidationSchemas,
} from '@esss-swap/duo-validation/lib/Call';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import { Wizard, WizardStep } from 'components/common/MultistepWizard';
import { Call } from 'generated/sdk';
import { useProposalWorkflowsData } from 'hooks/settings/useProposalWorkflowsData';
import { useProposalsTemplates } from 'hooks/template/useProposalTemplates';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CallGeneralInfo, { AllocationTimeUnits } from './CallGeneralInfo';
import CallNotificationAndCycleInfo from './CallNotificationAndCycleInfo';
import CallReviewsInfo from './CallReviewsInfo';

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const CreateUpdateCall: React.FC<CreateUpdateCallProps> = ({ call, close }) => {
  const { api } = useDataApiWithFeedback();
  const { templates, loadingTemplates } = useProposalsTemplates(false);
  const {
    proposalWorkflows,
    loadingProposalWorkflows,
  } = useProposalWorkflowsData();

  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);

  const currentDayEnd = new Date();
  currentDayEnd.setHours(23, 59, 59, 999);

  const initialValues = call
    ? {
        ...call,
        templateId: call.templateId || '',
        proposalWorkflowId: call.proposalWorkflowId || '',
        // allocationTimeUnit: call.allocationTimeUnit || AllocationTimeUnits.Days,
      }
    : {
        shortCode: '',
        startCall: currentDayStart,
        endCall: currentDayEnd,
        referenceNumberFormat: '',
        startReview: currentDayStart,
        endReview: currentDayEnd,
        startSEPReview: currentDayStart,
        endSEPReview: currentDayEnd,
        startNotify: currentDayStart,
        endNotify: currentDayEnd,
        startCycle: currentDayStart,
        endCycle: currentDayEnd,
        cycleComment: '',
        surveyComment: '',
        proposalWorkflowId: '',
        templateId: '',
        allocationTimeUnit: AllocationTimeUnits.Days,
      };

  const closeModal = (error: string | null | undefined, callToReturn: Call) => {
    if (!error) {
      close(callToReturn);
    }
  };

  return (
    <>
      <Typography variant="h6">
        {call ? 'Update the call' : 'Create new call'}
      </Typography>
      <Wizard
        initialValues={initialValues}
        onSubmit={async (values) => {
          const {
            id,
            templateId,
            proposalWorkflowId,
            ...restValues
          } = values as Call;
          if (call) {
            const data = await api('Call updated successfully!').updateCall({
              ...restValues,
              id: id,
              templateId: templateId ? +templateId : null,
              proposalWorkflowId: proposalWorkflowId
                ? +proposalWorkflowId
                : null,
            });
            closeModal(
              data.updateCall.rejection?.reason,
              data.updateCall.call as Call
            );
          } else {
            const data = await api('Call created successfully!').createCall({
              ...restValues,
              templateId: templateId ? +templateId : null,
              proposalWorkflowId: proposalWorkflowId
                ? +proposalWorkflowId
                : null,
            });

            closeModal(
              data.createCall.rejection?.reason,
              data.createCall.call as Call
            );
          }
        }}
        shouldCreate={!call}
      >
        <WizardStep
          title="General"
          validationSchema={
            !!call
              ? updateCallValidationSchemas[0]
              : createCallValidationSchemas[0]
          }
        >
          <CallGeneralInfo
            templates={templates}
            loadingTemplates={loadingTemplates}
            proposalWorkflows={proposalWorkflows}
            loadingProposalWorkflows={loadingProposalWorkflows}
          />
        </WizardStep>
        <WizardStep
          title="Reviews"
          validationSchema={
            !!call
              ? updateCallValidationSchemas[1]
              : createCallValidationSchemas[1]
          }
        >
          <CallReviewsInfo />
        </WizardStep>
        <WizardStep
          title="Notification and cycle"
          validationSchema={
            !!call
              ? updateCallValidationSchemas[2]
              : createCallValidationSchemas[2]
          }
        >
          <CallNotificationAndCycleInfo />
        </WizardStep>
      </Wizard>
    </>
  );
};

CreateUpdateCall.propTypes = {
  close: PropTypes.func.isRequired,
  call: PropTypes.any,
};

export default CreateUpdateCall;
