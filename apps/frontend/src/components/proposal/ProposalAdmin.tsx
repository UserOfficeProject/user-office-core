import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { administrationProposalValidationSchema } from '@user-office-software/duo-validation/lib/Proposal';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import React from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import FormikUIPredefinedMessagesTextField, {
  PredefinedMessageKey,
} from 'components/common/predefinedMessages/FormikUIPredefinedMessagesTextField';
import { ProposalEndStatus, UserRole } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';

export type AdministrationFormData = {
  proposalPk: number;
  commentForUser: string;
  commentForManagement: string;
  finalStatus: ProposalEndStatus;
  managementTimeAllocation?: number;
  managementDecisionSubmitted?: boolean;
};

type ProposalAdminProps = {
  data: ProposalData;
  setAdministration: (data: AdministrationFormData) => void;
};

const ProposalAdmin = ({ data, setAdministration }: ProposalAdminProps) => {
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const initialValues = {
    proposalPk: data.primaryKey,
    finalStatus: data.finalStatus || ProposalEndStatus.UNSET,
    commentForUser: data.commentForUser || '',
    commentForManagement: data.commentForManagement || '',
    managementTimeAllocation: data.managementTimeAllocation || '',
    managementDecisionSubmitted: data.managementDecisionSubmitted,
  };

  const statusOptions: Option[] = [
    { text: 'Unset', value: ProposalEndStatus.UNSET },
    { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
    { text: 'Reserved', value: ProposalEndStatus.RESERVED },
    { text: 'Rejected', value: ProposalEndStatus.REJECTED },
  ];

  const PromptIfDirty = () => {
    const formik = useFormikContext();

    return (
      <Prompt
        when={formik.dirty && formik.submitCount === 0}
        message="Changes you recently made in this tab will be lost! Are you sure?"
      />
    );
  };

  const handleProposalAdministration = async (
    administrationValues: AdministrationFormData
  ) => {
    await api({
      toastSuccessMessage: 'Saved!',
    }).administrationProposal(administrationValues);

    setAdministration(administrationValues);
  };

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        Administration
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={administrationProposalValidationSchema}
        onSubmit={async (values): Promise<void> => {
          const administrationValues = {
            proposalPk: data.primaryKey,
            finalStatus:
              ProposalEndStatus[values.finalStatus as ProposalEndStatus],
            commentForUser: values.commentForUser,
            commentForManagement: values.commentForManagement,
            managementTimeAllocation: +values.managementTimeAllocation,
            managementDecisionSubmitted: values.managementDecisionSubmitted,
          };

          await handleProposalAdministration(administrationValues);
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel
                    htmlFor="finalStatus"
                    shrink={!!values.finalStatus}
                    required
                  >
                    Status
                  </InputLabel>
                  <Field
                    name="finalStatus"
                    component={Select}
                    data-cy="proposal-final-status"
                    disabled={!isUserOfficer || isSubmitting}
                    MenuProps={{ 'data-cy': 'proposal-final-status-options' }}
                    required
                  >
                    {statusOptions.map(({ value, text }) => (
                      <MenuItem value={value} key={value}>
                        {text}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="managementTimeAllocation"
                  label={`Management time allocation(${data.call?.allocationTimeUnit}s)`}
                  id="time-managemment-input"
                  type="number"
                  component={TextField}
                  fullWidth
                  autoComplete="off"
                  data-cy="managementTimeAllocation"
                  disabled={!isUserOfficer || isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <FormikUIPredefinedMessagesTextField
                  name="commentForUser"
                  label="Comment for user"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="commentForUser"
                  multiline
                  rows={4}
                  disabled={!isUserOfficer || isSubmitting}
                  message-key={PredefinedMessageKey.USER}
                />
              </Grid>
              <Grid item xs={12}>
                <FormikUIPredefinedMessagesTextField
                  name="commentForManagement"
                  label="Comment for management"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="commentForManagement"
                  multiline
                  rows={4}
                  disabled={!isUserOfficer || isSubmitting}
                  message-key={PredefinedMessageKey.MANAGER}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledButtonContainer>
                  <Field
                    id="managementDecisionSubmitted"
                    name="managementDecisionSubmitted"
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{
                      label: 'Submitted',
                    }}
                    data-cy="is-management-decision-submitted"
                    disabled={!isUserOfficer || isSubmitting}
                  />

                  <Button
                    type="submit"
                    data-cy="save-admin-decision"
                    disabled={!isUserOfficer || isSubmitting}
                  >
                    Save
                  </Button>
                </StyledButtonContainer>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ProposalAdmin;
