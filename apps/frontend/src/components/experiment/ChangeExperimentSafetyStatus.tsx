import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useMemo } from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import WorkflowView from 'components/settings/workflow/WorkflowView';
import { Experiment, WorkflowStatus, WorkflowType } from 'generated/sdk';
import { useWorkflowStatusesData } from 'hooks/settings/useWorkflowStatusesData';

const ChangeExperimentSafetyStatusValidationSchema = yup.object().shape({
  selectedWorkflowStatusId: yup
    .string()
    .required('You must select experiment safety status'),
});

type ChangeExperimentSafetyStatusProps = {
  close: () => void;
  changeStatusOnExperiments: (workflowStatus: WorkflowStatus) => Promise<void>;
  selectedExperiments: Experiment[];
};

const ChangeExperimentSafetyStatus = ({
  close,
  changeStatusOnExperiments,
  selectedExperiments,
}: ChangeExperimentSafetyStatusProps) => {
  const selectedExperimentStatuses = selectedExperiments.map(
    (experiment) => experiment.experimentSafety?.workflowStatusId
  );
  const selectedExperimentsWorkflowIds = selectedExperiments
    .map((experiment) => experiment.proposal.call?.experimentWorkflowId)
    .filter((id): id is number => !!id);
  const {
    statuses: experimentStatuses,
    loadingStatuses: loadingExperimentStatuses,
  } = useWorkflowStatusesData(selectedExperimentsWorkflowIds[0]);

  const allSelectedExperimentsHaveSameWorkflowStatus =
    selectedExperimentStatuses.every(
      (item) => item === selectedExperimentStatuses[0]
    );

  const allExperimentsHaveSameWorkflow = selectedExperimentsWorkflowIds.every(
    (id) => id === selectedExperimentsWorkflowIds[0]
  );

  const selectedExperimentsWorkflowStatus =
    allSelectedExperimentsHaveSameWorkflowStatus
      ? selectedExperimentStatuses[0]
      : null;

  const highlightedNodes = useMemo(() => {
    const counts = selectedExperiments.reduce(
      (acc, experiment) => {
        const workflowStatus = experimentStatuses.find(
          (ws) =>
            ws.workflowStatusId ===
            experiment.experimentSafety?.workflowStatusId
        );
        if (workflowStatus) {
          const id = workflowStatus.status.id;
          if (!acc[id]) {
            acc[id] = [];
          }
          acc[id].push(experiment.experimentId);
        }

        return acc;
      },
      {} as Record<string, string[]>
    );

    return Object.entries(counts).map(([statusId, entities]) => ({
      statusId,
      entities,
    }));
  }, [selectedExperiments, experimentStatuses]);

  if (!allExperimentsHaveSameWorkflow) {
    return (
      <Container component="main" maxWidth="xs">
        <Alert severity="error" sx={{ mt: 4 }}>
          All selected experiments must belong to the same workflow in order to
          change their status.
        </Alert>
        <Button
          fullWidth
          sx={(theme) => ({
            margin: theme.spacing(3, 0, 2),
          })}
          onClick={close}
          data-cy="close-experiment-status-change-error"
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
          selectedWorkflowStatusId: selectedExperimentsWorkflowStatus,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const selectedStatus = experimentStatuses.find(
            (status) =>
              status.workflowStatusId === values.selectedWorkflowStatusId
          );

          if (!selectedStatus) {
            actions.setFieldError('selectedWorkflowStatusId', 'Required');

            return;
          }

          await changeStatusOnExperiments(selectedStatus);
          close();
        }}
        validationSchema={ChangeExperimentSafetyStatusValidationSchema}
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
                  Change experiment(s) safety status
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <div style={{ height: '500px', border: '1px solid #ddd' }}>
                  <WorkflowView
                    workflowId={selectedExperimentsWorkflowIds[0]}
                    entityType={WorkflowType.EXPERIMENT}
                    highlightedNodes={highlightedNodes}
                    selectedStatusId={
                      experimentStatuses.find(
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
                      label="Select experiment status"
                      loading={loadingExperimentStatuses}
                      items={experimentStatuses.map((status) => ({
                        value: status.workflowStatusId,
                        text: status.status.name,
                      }))}
                      required
                      disabled={isSubmitting}
                      data-cy="status-selection"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {!values.selectedWorkflowStatusId && (
                      <Alert
                        severity="warning"
                        data-cy="experiment-different-statuses-change"
                      >
                        Be aware that selected experiments have different
                        statuses and changing status will affect all of them.
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      sx={(theme) => ({
                        margin: theme.spacing(3, 0, 2),
                      })}
                      disabled={loadingExperimentStatuses || isSubmitting}
                      data-cy="submit-experiment-status-change"
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

export default ChangeExperimentSafetyStatus;
