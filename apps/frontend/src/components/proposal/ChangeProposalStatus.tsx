import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import i18n from 'i18n';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import WorkflowView from 'components/settings/workflow/WorkflowView';
import { WorkflowStatus, WorkflowType } from 'generated/sdk';
import { useWorkflowStatusesData } from 'hooks/settings/useWorkflowStatusesData';

const changeProposalStatusValidationSchema = yup.object().shape({
  selectedWorkflowStatusId: yup
    .string()
    .required('You must select proposal status'),
});

type ChangeProposalStatusProps = {
  close: () => void;
  changeStatusOnProposals: (workflowStatus: WorkflowStatus) => Promise<void>;
  allSelectedProposalsHaveInstrument: boolean;
  selectedProposalStatuses: number[];
  selectedProposalsWorkflowIds: number[];
};

const ChangeProposalStatus = ({
  close,
  changeStatusOnProposals,
  allSelectedProposalsHaveInstrument,
  selectedProposalStatuses,
  selectedProposalsWorkflowIds,
}: ChangeProposalStatusProps) => {
  const { t } = useTranslation();
  const {
    statuses: proposalStatuses,
    loadingStatuses: loadingProposalStatuses,
  } = useWorkflowStatusesData(selectedProposalsWorkflowIds[0]);

  const allSelectedProposalsHaveSameWorkflowStatus =
    selectedProposalStatuses.every(
      (item) => item === selectedProposalStatuses[0]
    );

  const allProposalsHaveSameWorkflow = selectedProposalsWorkflowIds.every(
    (id) => id === selectedProposalsWorkflowIds[0]
  );

  const selectedProposalsWorkflowStatus =
    allSelectedProposalsHaveSameWorkflowStatus
      ? selectedProposalStatuses[0]
      : null;

  const highlightedNodes = useMemo(() => {
    // We don't have proposal IDs passed down, only statuses.
    // So we just group by status ID and put a dummy entity count.
    // In a real scenario, we would map actual proposal IDs here.
    const counts = selectedProposalStatuses.reduce(
      (acc, statusId) => {
        const workflowStatus = proposalStatuses.find(
          (ws) => ws.workflowStatusId === statusId
        );
        if (workflowStatus) {
          const id = workflowStatus.status.id;
          if (!acc[id]) {
            acc[id] = [];
          }
          acc[id].push('Proposal ' + acc[id].length); // Placeholder ID
        }

        return acc;
      },
      {} as Record<string, string[]>
    );

    return Object.entries(counts).map(([statusId, entities]) => ({
      statusId,
      entities,
    }));
  }, [selectedProposalStatuses, proposalStatuses]);

  if (!allProposalsHaveSameWorkflow) {
    return (
      <Container component="main" maxWidth="xs">
        <Alert severity="error" sx={{ mt: 4 }}>
          All selected proposals must belong to the same workflow in order to
          change their status.
        </Alert>
        <Button
          fullWidth
          sx={(theme) => ({
            margin: theme.spacing(3, 0, 2),
          })}
          onClick={close}
          data-cy="close-proposal-status-change-error"
        >
          Close
        </Button>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg">
      <Formik
        initialValues={{
          selectedWorkflowStatusId: selectedProposalsWorkflowStatus,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const selectedStatus = proposalStatuses.find(
            (status) =>
              status.workflowStatusId === values.selectedWorkflowStatusId
          );

          if (!selectedStatus) {
            actions.setFieldError('selectedWorkflowStatusId', 'Required');

            return;
          }

          await changeStatusOnProposals(selectedStatus);
          close();
        }}
        validationSchema={changeProposalStatusValidationSchema}
      >
        {({ isSubmitting, values, setFieldValue }): JSX.Element => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  component="h1"
                  sx={{
                    fontSize: '18px',
                    padding: '22px 0 0',
                  }}
                >
                  Change proposal(s) status
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <div style={{ height: '500px', border: '1px solid #ddd' }}>
                  <WorkflowView
                    workflowId={selectedProposalsWorkflowIds[0]}
                    entityType={WorkflowType.PROPOSAL}
                    highlightedNodes={highlightedNodes}
                    selectedStatusId={
                      proposalStatuses.find(
                        (s) =>
                          s.workflowStatusId === values.selectedWorkflowStatusId
                      )?.status.id
                    }
                    onNodeClicked={(statusId, workflowStatusId) => {
                      setFieldValue(
                        'selectedWorkflowStatusId',
                        workflowStatusId
                      );
                    }}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormikUIAutocomplete
                      name="selectedWorkflowStatusId"
                      label="Select proposal status"
                      loading={loadingProposalStatuses}
                      items={proposalStatuses.map((status) => ({
                        value: status.workflowStatusId,
                        text: status.status.name,
                      }))}
                      required
                      disabled={isSubmitting}
                      data-cy="status-selection"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {proposalStatuses.find(
                      (status) =>
                        status.workflowStatusId ===
                        values.selectedWorkflowStatusId
                    )?.statusId === 'DRAFT' && (
                      <Alert severity="warning">
                        Be aware that changing status to &quot;DRAFT&quot; will
                        reopen proposal for changes and submission.
                      </Alert>
                    )}
                    {proposalStatuses.find(
                      (status) =>
                        status.workflowStatusId ===
                        values.selectedWorkflowStatusId
                    )?.statusId === 'SCHEDULING' &&
                      !allSelectedProposalsHaveInstrument && (
                        <Alert severity="warning">
                          {`Be aware that proposal/s not assigned to an ${i18n.format(
                            t('instrument'),
                            'lowercase'
                          )} will not be shown in the scheduler after changing status to "SCHEDULING"`}
                        </Alert>
                      )}
                    {!values.selectedWorkflowStatusId && (
                      <Alert
                        severity="warning"
                        data-cy="proposal-different-statuses-change"
                      >
                        Be aware that selected proposals have different statuses
                        and changing status will affect all of them.
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      sx={(theme) => ({
                        margin: theme.spacing(3, 0, 2),
                      })}
                      disabled={loadingProposalStatuses || isSubmitting}
                      data-cy="submit-proposal-status-change"
                    >
                      Change status
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default ChangeProposalStatus;
