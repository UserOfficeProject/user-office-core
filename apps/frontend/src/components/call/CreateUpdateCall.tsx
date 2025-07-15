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
  CreateCallInput,
  WorkflowType,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useActiveTemplates } from 'hooks/call/useCallTemplates';
import { useWorkflowsData } from 'hooks/settings/useWorkflowsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CallGeneralInfo from './CallGeneralInfo';
import CallNotificationAndCycleInfo from './CallNotificationAndCycleInfo';
import CallReviewsInfo from './CallReviewsInfo';

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const CreateUpdateCall = ({ call, close }: CreateUpdateCallProps) => {
  const { api } = useDataApiWithFeedback();
  const { timezone } = useFormattedDateTime();

  const { templates: proposalTemplates, refreshTemplates: reloadProposal } =
    useActiveTemplates(TemplateGroupId.PROPOSAL, call?.templateId);

  const { templates: proposalEsiTemplates, refreshTemplates: reloadEsi } =
    useActiveTemplates(TemplateGroupId.PROPOSAL_ESI, call?.esiTemplateId);

  const {
    templates: proposalPdfTemplates,
    refreshTemplates: reloadProposalPdfTemplates,
  } = useActiveTemplates(
    TemplateGroupId.PROPOSAL_PDF,
    call?.proposalPdfTemplateId
  );

  const {
    templates: experimentSafetyPdfTemplates,
    refreshTemplates: reloadExperimentSafetyPdfTemplates,
  } = useActiveTemplates(
    TemplateGroupId.EXPERIMENT_SAFETY_PDF,
    call?.experimentSafetyPdfTemplateId
  );

  const {
    templates: fapReviewTemplates,
    refreshTemplates: reloadFapReviewTemplates,
  } = useActiveTemplates(TemplateGroupId.FAP_REVIEW, call?.fapReviewTemplateId);

  const {
    templates: technicalReviewTemplates,
    refreshTemplates: reloadTechnicalReviewTemplates,
  } = useActiveTemplates(
    TemplateGroupId.TECHNICAL_REVIEW,
    call?.technicalReviewTemplateId
  );

  const {
    workflows: proposalWorkflows,
    loadingWorkflows: loadingProposalWorkflows,
    refreshWorkflows: reloadProposalWorkflows,
  } = useWorkflowsData(WorkflowType.PROPOSAL);

  const {
    workflows: experimentWorkflows,
    loadingWorkflows: loadingExperimentWorkflows,
    refreshWorkflows: reloadExperimentWorkflows,
  } = useWorkflowsData(WorkflowType.EXPERIMENT);

  const currentDayStart = DateTime.now()
    .setZone(timezone || undefined)
    .startOf('day');
  const currentDayEnd = DateTime.now()
    .setZone(timezone || undefined)
    .endOf('day')
    .set({ second: 0, millisecond: 0 });

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
        proposalPdfTemplateId: call.proposalPdfTemplateId,
        experimentSafetyPdfTemplateId: call.experimentSafetyPdfTemplateId,
        fapReviewTemplateId: call.fapReviewTemplateId,
        technicalReviewTemplateId: call.technicalReviewTemplateId,
        proposalWorkflowId: call.proposalWorkflowId,
        referenceNumberFormat: call.referenceNumberFormat || '',
        startCall: getDateTimeFromISO(call.startCall),
        endCall: getDateTimeFromISO(call.endCall),
        startEndDate: {
          from: getDateTimeFromISO(call.startCall),
          to: getDateTimeFromISO(call.endCall),
        },
        startReview: getDateTimeFromISO(call.startReview),
        endReview: getDateTimeFromISO(call.endReview),
        startFapReview: getDateTimeFromISO(call.startFapReview),
        endFapReview: getDateTimeFromISO(call.endFapReview),
        startNotify: getDateTimeFromISO(call.startNotify),
        endNotify: getDateTimeFromISO(call.endNotify),
        startCycle: getDateTimeFromISO(call.startCycle),
        endCycle: getDateTimeFromISO(call.endCycle),
        submissionMessage: call.submissionMessage || '',
        faps: call.faps?.map((fap) => fap.id),
      }
    : {
        shortCode: '',
        startCall: currentDayStart,
        endCall: currentDayEnd,
        startEndDate: {
          from: getDateTimeFromISO(currentDayStart.toISO() || ''),
          to: getDateTimeFromISO(currentDayEnd.toISO() || ''),
        },
        referenceNumberFormat: '',
        startReview: currentDayStart,
        endReview: currentDayEnd,
        startFapReview: currentDayStart,
        endFapReview: currentDayEnd,
        startNotify: currentDayStart,
        endNotify: currentDayEnd,
        startCycle: currentDayStart,
        endCycle: currentDayEnd,
        cycleComment: '',
        surveyComment: '',
        proposalWorkflowId: null,
        templateId: null,
        esiTemplateId: null,
        pdfTemplateId: null,
        fapReviewTemplateId: null,
        technicalReviewTemplateId: null,
        allocationTimeUnit: AllocationTimeUnits.DAY,
        title: '',
        description: '',
        submissionMessage: '',
        faps: [],
      };

  return (
    <>
      <Typography variant="h6" component="h1">
        {call ? 'Update the call' : 'Create new call'}
      </Typography>
      <Wizard
        initialValues={initialValues}
        onSubmit={async (values) => {
          console.log({ values });
          if (call) {
            const { updateCall } = await api({
              toastSuccessMessage: 'Call updated successfully!',
            }).updateCall({
              ...(values as UpdateCallInput),
              startCall: values.startEndDate.from,
              endCall: values.startEndDate.to,
            });
            close(updateCall as Call);
          } else {
            const { createCall } = await api({
              toastSuccessMessage: 'Call created successfully!',
            }).createCall({
              ...(values as CreateCallInput),
              startCall: values.startEndDate.from,
              endCall: values.startEndDate.to,
            });

            close(createCall as Call);
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
            reloadTemplates={reloadProposal}
            reloadEsi={reloadEsi}
            reloadProposalPdfTemplates={reloadProposalPdfTemplates}
            reloadExperimentSafetyPdfTemplates={
              reloadExperimentSafetyPdfTemplates
            }
            reloadFapReviewTemplates={reloadFapReviewTemplates}
            reloadTechnicalReviewTemplates={reloadTechnicalReviewTemplates}
            reloadProposalWorkflows={reloadProposalWorkflows}
            templates={proposalTemplates}
            esiTemplates={proposalEsiTemplates}
            proposalPdfTemplates={proposalPdfTemplates}
            experimentSafetyPdfTemplates={experimentSafetyPdfTemplates}
            fapReviewTemplates={fapReviewTemplates}
            technicalReviewTemplates={technicalReviewTemplates}
            loadingTemplates={!proposalTemplates || !proposalEsiTemplates}
            proposalWorkflows={proposalWorkflows}
            loadingProposalWorkflows={loadingProposalWorkflows}
            experimentWorkflows={experimentWorkflows}
            loadingExperimentWorkflows={loadingExperimentWorkflows}
            reloadExperimentWorkflows={reloadExperimentWorkflows}
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
