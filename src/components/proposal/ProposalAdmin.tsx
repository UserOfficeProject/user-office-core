import { administrationProposalValidationSchema } from '@esss-swap/duo-validation';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { Fragment } from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import { Proposal } from 'generated/sdk';
import { ProposalEndStatus, ProposalStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ButtonContainer } from 'styles/StyledComponents';

export default function ProposalAdmin(props: { data: Proposal }) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = {
    finalStatus: props.data.finalStatus || ProposalEndStatus.UNSET,
    proposalStatus: props.data.status,
    commentForUser: props.data.commentForUser || '',
    commentForManagement: props.data.commentForManagement || '',
  };

  return (
    <Fragment>
      <Typography variant="h6" gutterBottom>
        Administration
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={administrationProposalValidationSchema}
        onSubmit={async (values, actions) => {
          await api()
            .administrationProposal({
              id: props.data.id,
              finalStatus:
                ProposalEndStatus[values.finalStatus as ProposalEndStatus],
              status: ProposalStatus[values.proposalStatus as ProposalStatus],
              commentForUser: values.commentForUser,
              commentForManagement: values.commentForManagement,
            })
            .then(data =>
              enqueueSnackbar('Updated', {
                variant: data.administrationProposal.error
                  ? 'error'
                  : 'success',
              })
            );
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="finalStatus"
                  label="Final status"
                  data-cy="proposalFinalStatus"
                  items={[
                    { text: 'Unset', value: ProposalEndStatus.UNSET },
                    { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
                    { text: 'Reserved', value: ProposalEndStatus.RESERVED },
                    { text: 'Rejected', value: ProposalEndStatus.REJECTED },
                  ]}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormikDropdown
                  name="proposalStatus"
                  label="Proposal status"
                  data-cy="proposalStatus"
                  items={[
                    { text: '', value: ProposalStatus.BLANK },
                    { text: 'Draft', value: ProposalStatus.DRAFT },
                    { text: 'Submitted', value: ProposalStatus.SUBMITTED },
                  ]}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="commentForUser"
                  label="Comment for user"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="commentForUser"
                  multiline
                  rowsMax="16"
                  rows="4"
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="commentForManagement"
                  label="Comment for management"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="commentForManagement"
                  multiline
                  rowsMax="16"
                  rows="4"
                />
              </Grid>
            </Grid>
            <ButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
              >
                Update
              </Button>
            </ButtonContainer>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}
