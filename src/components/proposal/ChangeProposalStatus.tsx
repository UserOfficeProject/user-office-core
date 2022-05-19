import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { ProposalStatus } from 'generated/sdk';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';

const changeProposalStatusValidationSchema = yup.object().shape({
  selectedStatusId: yup.string().required('You must select proposal status'),
});

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type ChangeProposalStatusProps = {
  close: () => void;
  changeStatusOnProposals: (status: ProposalStatus) => Promise<void>;
  allSelectedProposalsHaveInstrument: boolean;
  selectedProposalStatuses: number[];
};

const ChangeProposalStatus: React.FC<ChangeProposalStatusProps> = ({
  close,
  changeStatusOnProposals,
  allSelectedProposalsHaveInstrument,
  selectedProposalStatuses,
}) => {
  const classes = useStyles();
  const { proposalStatuses, loadingProposalStatuses } =
    useProposalStatusesData();

  const allSelectedProposalsHaveSameStatus = selectedProposalStatuses.every(
    (item) => item === selectedProposalStatuses[0]
  );

  const selectedProposalsStatus = allSelectedProposalsHaveSameStatus
    ? selectedProposalStatuses[0]
    : undefined;

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedStatusId: selectedProposalsStatus,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const selectedStatus = proposalStatuses.find(
            (call) => call.id === values.selectedStatusId
          );

          if (!selectedStatus) {
            actions.setFieldError('selectedStatusId', 'Required');

            return;
          }

          await changeStatusOnProposals(selectedStatus);
          close();
        }}
        validationSchema={changeProposalStatusValidationSchema}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form style={{ width: '240px' }}>
            <Typography
              variant="h6"
              component="h1"
              className={classes.cardHeader}
            >
              Change proposal/s status
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedStatusId"
                  label="Select proposal status"
                  loading={loadingProposalStatuses}
                  items={proposalStatuses.map((status) => ({
                    value: status.id,
                    text: status.name,
                  }))}
                  required
                  disabled={isSubmitting}
                  data-cy="status-selection"
                />
              </Grid>
            </Grid>
            {values.selectedStatusId === 1 && (
              <Alert severity="warning">
                Be aware that changing status to &quot;DRAFT&quot; will reopen
                proposal for changes and submission.
              </Alert>
            )}
            {values.selectedStatusId === 8 &&
              !allSelectedProposalsHaveInstrument && (
                <Alert severity="warning">
                  Be aware that proposal/s not assigned to an instrument will
                  not be shown in the scheduler after changing status to
                  &quot;SCHEDULING&quot;.
                </Alert>
              )}
            {!values.selectedStatusId && (
              <Alert
                severity="warning"
                data-cy="proposal-different-statuses-change"
              >
                Be aware that selected proposals have different statuses and
                changing status will affect all of them.
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
              disabled={loadingProposalStatuses || isSubmitting}
              data-cy="submit-proposal-status-change"
            >
              Change status
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default ChangeProposalStatus;
