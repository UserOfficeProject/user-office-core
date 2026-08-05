import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import WorkflowView from 'components/settings/workflow/WorkflowView';
import {
  Experiment,
  GetWorkflowQuery,
  WorkflowStatus,
  WorkflowType,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useWorkflowStatusesData } from 'hooks/settings/useWorkflowStatusesData';

type WorkflowConnectionWithDetails = NonNullable<
  GetWorkflowQuery['workflow']
>['connections'][0];

const ChangeExperimentSafetyStatusValidationSchema = yup.object().shape({
  selectedWorkflowStatusId: yup
    .number()
    .nullable()
    .required('You must select experiment safety status'),
});

type ChangeExperimentSafetyStatusProps = {
  close: () => void;
  changeStatusOnExperiments: (
    workflowStatus: WorkflowStatus,
    statusActionsWorkflowConnectionId?: number
  ) => Promise<void>;
  selectedExperiments: Experiment[];
};

type ChangeExperimentSafetyStatusFormProps =
  ChangeExperimentSafetyStatusProps & {
    workflowId: number;
  };

const StatusChangeErrorMessage = ({
  message,
  close,
}: {
  message: string;
  close: () => void;
}) => (
  <Container component="main" maxWidth="xs">
    <Alert severity="error" sx={{ mt: 4 }}>
      {message}
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

const ChangeExperimentSafetyStatusForm = ({
  close,
  changeStatusOnExperiments,
  selectedExperiments,
  workflowId,
}: ChangeExperimentSafetyStatusFormProps) => {
  const selectedExperimentStatuses = selectedExperiments.map(
    (experiment) => experiment.experimentSafety?.workflowStatusId
  );
  const api = useDataApi();
  const {
    statuses: experimentStatuses,
    loadingStatuses: loadingExperimentStatuses,
  } = useWorkflowStatusesData(workflowId);

  const [runStatusActions, setRunStatusActions] = useState(false);
  const [connections, setConnections] = useState<
    WorkflowConnectionWithDetails[]
  >([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    api()
      .getWorkflow({
        workflowId,
        entityType: WorkflowType.EXPERIMENT,
      })
      .then((data) => {
        if (data.workflow?.connections) {
          setConnections(data.workflow.connections);
        }
      });
  }, [api, workflowId]);
  const allSelectedExperimentsHaveSameWorkflowStatus =
    selectedExperimentStatuses.every(
      (workflowStatusId) => workflowStatusId === selectedExperimentStatuses[0]
    );

  const selectedExperimentsWorkflowStatus =
    allSelectedExperimentsHaveSameWorkflowStatus
      ? selectedExperimentStatuses[0]
      : null;

  const getConnectionsToStatus = (
    workflowStatusId: number | null
  ): WorkflowConnectionWithDetails[] => {
    if (!workflowStatusId) return [];

    return connections.filter(
      (conn) => conn.nextWorkflowStatusId === workflowStatusId
    );
  };

  const getConnectionLabel = (conn: WorkflowConnectionWithDetails): string => {
    const actionTypes = conn.statusActions
      ?.map((a) => a.action.type)
      .join(', ');
    const actionSummary = actionTypes ? ` [${actionTypes}]` : ' [no actions]';

    return `From "${conn.prevStatus.status.name}"${actionSummary}`;
  };

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

  return (
    <Container component="main" maxWidth="lg">
      <Formik
        initialValues={{
          selectedWorkflowStatusId: selectedExperimentsWorkflowStatus ?? null,
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

          await changeStatusOnExperiments(
            selectedStatus,
            runStatusActions && selectedConnectionId
              ? selectedConnectionId
              : undefined
          );
          close();
        }}
        validationSchema={ChangeExperimentSafetyStatusValidationSchema}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          const incomingConnections = getConnectionsToStatus(
            values.selectedWorkflowStatusId
          );
          const connectionsWithActions = incomingConnections.filter(
            (conn) => conn.statusActions && conn.statusActions.length > 0
          );

          return (
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
                  <div style={{ height: '500px' }}>
                    <WorkflowView
                      workflowId={workflowId}
                      entityType={WorkflowType.EXPERIMENT}
                      highlightedNodes={highlightedNodes}
                      selectedStatusId={
                        experimentStatuses.find(
                          (s) =>
                            s.workflowStatusId ===
                            values.selectedWorkflowStatusId
                        )?.status.id
                      }
                      onNodeClicked={(_statusId, workflowStatusId) => {
                        setFieldValue(
                          'selectedWorkflowStatusId',
                          workflowStatusId
                        );
                        setRunStatusActions(false);
                        setSelectedConnectionId(null);
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
                        onChange={(_: React.SyntheticEvent, value: number) => {
                          setFieldValue('selectedWorkflowStatusId', value);
                          setRunStatusActions(false);
                          setSelectedConnectionId(null);
                        }}
                      />
                    </Grid>

                    {values.selectedWorkflowStatusId &&
                      connectionsWithActions.length > 0 && (
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={runStatusActions}
                                onChange={(e) => {
                                  setRunStatusActions(e.target.checked);
                                  if (!e.target.checked) {
                                    setSelectedConnectionId(null);
                                  } else if (
                                    connectionsWithActions.length === 1
                                  ) {
                                    setSelectedConnectionId(
                                      connectionsWithActions[0].id
                                    );
                                  }
                                }}
                                data-cy="run-status-actions-checkbox"
                              />
                            }
                            label="Run status actions"
                          />

                          {runStatusActions &&
                            connectionsWithActions.length > 1 && (
                              <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel id="connection-select-label">
                                  Select transition
                                </InputLabel>
                                <Select
                                  labelId="connection-select-label"
                                  value={selectedConnectionId ?? ''}
                                  label="Select transition"
                                  onChange={(e) => {
                                    setSelectedConnectionId(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null
                                    );
                                  }}
                                  disabled={isSubmitting}
                                  data-cy="connection-selection"
                                >
                                  {connectionsWithActions.map((conn) => (
                                    <MenuItem key={conn.id} value={conn.id}>
                                      {getConnectionLabel(conn)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}

                          {runStatusActions && selectedConnectionId && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              {(() => {
                                const conn = connectionsWithActions.find(
                                  (c) => c.id === selectedConnectionId
                                );
                                if (!conn?.statusActions?.length) return null;

                                return (
                                  <>
                                    Actions to execute:
                                    <ul
                                      style={{
                                        margin: '4px 0',
                                        paddingLeft: '20px',
                                      }}
                                    >
                                      {conn.statusActions.map((action) => (
                                        <li key={action.actionId}>
                                          {action.action.name} (
                                          {action.action.type})
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                );
                              })()}
                            </Alert>
                          )}
                        </Grid>
                      )}

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
          );
        }}
      </Formik>
    </Container>
  );
};

const ChangeExperimentSafetyStatus = ({
  close,
  changeStatusOnExperiments,
  selectedExperiments,
}: ChangeExperimentSafetyStatusProps) => {
  const selectedExperimentsWorkflowIds = selectedExperiments
    .map((experiment) => experiment.proposal.call?.experimentWorkflowId)
    .filter((id): id is number => !!id);

  if (selectedExperimentsWorkflowIds.length === 0) {
    return (
      <StatusChangeErrorMessage
        message="Selected experiments do not have an associated workflow, so their status cannot be changed."
        close={close}
      />
    );
  }

  const [workflowId] = selectedExperimentsWorkflowIds;
  const allExperimentsHaveSameWorkflow = selectedExperimentsWorkflowIds.every(
    (id) => id === workflowId
  );

  if (!allExperimentsHaveSameWorkflow) {
    return (
      <StatusChangeErrorMessage
        message="All selected experiments must belong to the same workflow in order to change their status."
        close={close}
      />
    );
  }

  return (
    <ChangeExperimentSafetyStatusForm
      close={close}
      changeStatusOnExperiments={changeStatusOnExperiments}
      selectedExperiments={selectedExperiments}
      workflowId={workflowId}
    />
  );
};

export default ChangeExperimentSafetyStatus;
