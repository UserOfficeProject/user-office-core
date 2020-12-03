import { administrationProposalValidationSchema } from '@esss-swap/duo-validation/lib/Proposal';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { Fragment } from 'react';

import { useCheckAccess } from 'components/common/Can';
import FormikDropdown from 'components/common/FormikDropdown';
import { Proposal, UserRole } from 'generated/sdk';
import { ProposalEndStatus } from 'generated/sdk';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export type AdministrationFormData = {
  id: number;
  commentForUser: string;
  commentForManagement: string;
  finalStatus: ProposalEndStatus;
  rankOrder?: number;
};

export default function ProposalAdmin(props: {
  data: Proposal;
  setAdministration: (data: AdministrationFormData) => void;
}) {
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const {
    proposalStatuses,
    loadingProposalStatuses,
  } = useProposalStatusesData();

  const initialValues = {
    finalStatus: props.data.finalStatus || ProposalEndStatus.UNSET,
    proposalStatus: props.data.statusId,
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
        onSubmit={async (values): Promise<void> => {
          const administrationValues = {
            id: props.data.id,
            finalStatus:
              ProposalEndStatus[values.finalStatus as ProposalEndStatus],
            statusId: values.proposalStatus,
            commentForUser: values.commentForUser,
            commentForManagement: values.commentForManagement,
          };
          const data = await api('Updated!').administrationProposal(
            administrationValues
          );

          if (!data.administrationProposal.error) {
            props.setAdministration(administrationValues);
          }
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
                  disabled={!isUserOfficer}
                />
              </Grid>
              <Grid item xs={6}>
                <FormikDropdown
                  name="proposalStatus"
                  label="Proposal status"
                  data-cy="proposalStatus"
                  loading={loadingProposalStatuses}
                  items={proposalStatuses.map(proposalStatus => ({
                    text: proposalStatus.name,
                    value: proposalStatus.id,
                  }))}
                  required
                  disabled={!isUserOfficer}
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
                  disabled={!isUserOfficer}
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
                  disabled={!isUserOfficer}
                />
              </Grid>
            </Grid>
            {isUserOfficer && (
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
            )}
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}
