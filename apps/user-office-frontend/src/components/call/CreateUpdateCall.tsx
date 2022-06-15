import Typography from '@mui/material/Typography';
import {
  createCallValidationSchemas,
  updateCallValidationSchemas,
} from '@user-office-software/duo-validation/lib/Call';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import React from 'react';

import { Wizard, WizardStep } from 'components/common/MultistepWizard';
import {
  Call,
  AllocationTimeUnits,
  UpdateCallInput,
  TemplateGroupId,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useProposalWorkflowsData } from 'hooks/settings/useProposalWorkflowsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CallGeneralInfo from './CallGeneralInfo';
import CallNotificationAndCycleInfo from './CallNotificationAndCycleInfo';
import CallReviewsInfo from './CallReviewsInfo';

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const CreateUpdateCall: React.FC<CreateUpdateCallProps> = ({ call, close }) => {
  const { api } = useDataApiWithFeedback();
  const { timezone } = useFormattedDateTime();

  const { templates: proposalTemplates } = useActiveTemplates(
    TemplateGroupId.PROPOSAL,
    call?.templateId
  );

  const { templates: proposalEsiTemplates } = useActiveTemplates(
    TemplateGroupId.PROPOSAL_ESI,
    call?.esiTemplateId
  );
  const { proposalWorkflows, loadingProposalWorkflows } =
    useProposalWorkflowsData();

  const currentDayStart = DateTime.now()
    .setZone(timezone || undefined)
    .startOf('day');
  const currentDayEnd = DateTime.now()
    .setZone(timezone || undefined)
    .endOf('day');

  const getDateTimeFromISO = (value: string) =>
    DateTime.fromISO(value, {
      zone: timezone || undefined,
    }).isValid
      ? DateTime.fromISO(value, {
          zone: timezone || undefined,
        })
      : null;

  const initialValues = call
    ? {
        ...call,
        title: call.title || '',
        description: call.description || '',
        templateId: call.templateId,
        esiTemplateId: call.esiTemplateId,
        proposalWorkflowId: call.proposalWorkflowId,
        referenceNumberFormat: call.referenceNumberFormat || '',
        startCall: getDateTimeFromISO(call.startCall),
        endCall: getDateTimeFromISO(call.endCall),
        startReview: getDateTimeFromISO(call.startReview),
        endReview: getDateTimeFromISO(call.endReview),
        startSEPReview: getDateTimeFromISO(call.startSEPReview),
        endSEPReview: getDateTimeFromISO(call.endSEPReview),
        startNotify: getDateTimeFromISO(call.startNotify),
        endNotify: getDateTimeFromISO(call.endNotify),
        startCycle: getDateTimeFromISO(call.startCycle),
        endCycle: getDateTimeFromISO(call.endCycle),
        submissionMessage: call.submissionMessage || '',
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
        proposalWorkflowId: null,
        templateId: null,
        esiTemplateId: null,
        allocationTimeUnit: AllocationTimeUnits.DAY,
        title: '',
        description: '',
        submissionMessage: '',
      };

  const closeModal = (error: string | null | undefined, callToReturn: Call) => {
    if (!error) {
      close(callToReturn);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h1">
        {call ? 'Update the call' : 'Create new call'}
      </Typography>
      <Wizard
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (call) {
            const data = await api({
              toastSuccessMessage: 'Call updated successfully!',
            }).updateCall(values as UpdateCallInput);
            closeModal(
              data.updateCall.rejection?.reason,
              data.updateCall.call as Call
            );
          } else {
            const data = await api({
              toastSuccessMessage: 'Call created successfully!',
            }).createCall(values as UpdateCallInput);

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
            templates={proposalTemplates}
            esiTemplates={proposalEsiTemplates}
            loadingTemplates={!proposalTemplates || !proposalEsiTemplates}
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
