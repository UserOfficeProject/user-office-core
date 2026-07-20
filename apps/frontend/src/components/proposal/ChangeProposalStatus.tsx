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
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import i18n from 'i18n';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import WorkflowView from 'components/settings/workflow/WorkflowView';
import { GetWorkflowQuery, WorkflowStatus, WorkflowType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';
import { useWorkflowStatusesData } from 'hooks/settings/useWorkflowStatusesData';

type WorkflowConnectionWithDetails = NonNullable<
  GetWorkflowQuery['workflow']
>['connections'][0];

const changeProposalStatusValidationSchema = yup.object().shape({
  selectedWorkflowStatusId: yup
    .string()
    .required('You must select proposal status'),
});

type ChangeProposalStatusProps = {
  close: () => void;
  changeStatusOnProposals: (
    workflowStatus: WorkflowStatus,
    statusActionsWorkflowConnectionId?: number
  ) => Promise<void>;
  selectedProposals: ProposalViewData[];
};

const ChangeProposalStatus = ({
  close,
  changeStatusOnProposals,
  selectedProposals,
}: ChangeProposalStatusProps) => {
  const selectedProposalStatuses = selectedProposals.map(
    (p) => p.workflowStatusId
  );
  const allSelectedProposalsHaveInstrument = selectedProposals.every(
    (p) => p.instruments?.length
  );
  const selectedProposalsWorkflowIds = selectedProposals.map(
    (p) => p.workflowId
  );
  const { t } = useTranslation();
  const api = useDataApi();
  const {
    statuses: proposalStatuses,
    loadingStatuses: loadingProposalStatuses,
  } = useWorkflowStatusesData(selectedProposalsWorkflowIds[0]);

  const [runStatusActions, setRunStatusActions] = useState(false);
  const [connections, setConnections] = useState<
    WorkflowConnectionWithDetails[]
  >([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    number | null
  >(null);

  const allSelectedProposalsHaveSameWorkflowStatus =
    selectedProposalStatuses.every(
      (item) => item === selectedProposalStatuses[0]
    );

  const allProposalsHaveSameWorkflow = selectedProposalsWorkflowIds.every(
    (id) => id === selectedProposalsWorkflowIds[0]
  );

  // Fetch workflow connections when the component mounts
  useEffect(() => {
    if (!selectedProposalsWorkflowIds[0]) return;

    api()
      .getWorkflow({
        workflowId: selectedProposalsWorkflowIds[0],
        entityType: WorkflowType.PROPOSAL,
      })
      .then((data) => {
        if (data.workflow?.connections) {
          setConnections(data.workflow.connections);
        }
      });
  }, [api, selectedProposalsWorkflowIds[0]]);

  const highlightedNodes = useMemo(() => {
    const counts = selectedProposals.reduce(
      (acc, proposal) => {
        const workflowStatus = proposalStatuses.find(
          (ws) => ws.workflowStatusId === proposal.workflowStatusId
        );
        if (workflowStatus) {
          const statusId = workflowStatus.status.id;
          if (!acc[statusId]) {
            acc[statusId] = [];
          }
          acc[statusId].push(proposal.proposalId);
        }

        return acc;
      },
      {} as Record<string, string[]>
    );

    return Object.entries(counts).map(([statusId, entities]) => ({
      statusId,
      entities,
    }));
  }, [selectedProposals, proposalStatuses]);

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

  const selectedProposalsWorkflowStatus =
    allSelectedProposalsHaveSameWorkflowStatus
      ? selectedProposalStatuses[0]
      : null;

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

          await changeStatusOnProposals(
            selectedStatus,
            runStatusActions && selectedConnectionId
              ? selectedConnectionId
              : undefined
          );
          close();
        }}
        validationSchema={changeProposalStatusValidationSchema}
      >
        {({ isSubmitting, values, setFieldValue }): JSX.Element => {
          const incomingConnections = getConnectionsToStatus(
            values.selectedWorkflowStatusId
          );
          const connectionsWithActions = incomingConnections.filter(
            (conn) => conn.statusActions && conn.statusActions.length > 0
          );

          return (
            <Form>
              <Grid container spacing={3}>
                <Grid size={12}>
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

                <Grid
                  size={{
                    xs: 12,
                    md: 8
                  }}>
                  <div style={{ height: '500px' }}>
                    <WorkflowView
                      workflowId={selectedProposalsWorkflowIds[0]}
                      entityType={WorkflowType.PROPOSAL}
                      highlightedNodes={highlightedNodes}
                      selectedStatusId={
                        proposalStatuses.find(
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

                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <Grid container spacing={3}>
                    <Grid size={12}>
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
                        onChange={(_: React.SyntheticEvent, value: number) => {
                          setFieldValue('selectedWorkflowStatusId', value);
                          setRunStatusActions(false);
                          setSelectedConnectionId(null);
                        }}
                      />
                    </Grid>

                    {values.selectedWorkflowStatusId &&
                      connectionsWithActions.length > 0 && (
                        <Grid size={12}>
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

                    <Grid size={12}>
                      {proposalStatuses.find(
                        (status) =>
                          status.workflowStatusId ===
                          values.selectedWorkflowStatusId
                      )?.statusId === 'DRAFT' && (
                        <Alert severity="warning">
                          Be aware that changing status to &quot;DRAFT&quot;
                          will reopen proposal for changes and submission.
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
                          Be aware that selected proposals have different
                          statuses and changing status will affect all of them.
                        </Alert>
                      )}
                      {runStatusActions && !selectedConnectionId && (
                        <Alert severity="warning">
                          Please select a transition to run status actions for.
                        </Alert>
                      )}
                      <Button
                        type="submit"
                        fullWidth
                        sx={(theme) => ({
                          margin: theme.spacing(3, 0, 2),
                        })}
                        disabled={
                          loadingProposalStatuses ||
                          isSubmitting ||
                          (runStatusActions && !selectedConnectionId)
                        }
                        data-cy="submit-proposal-status-change"
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

export default ChangeProposalStatus;
