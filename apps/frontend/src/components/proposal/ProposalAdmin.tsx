import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Formik, Form, Field, useFormikContext, FieldArray } from 'formik';
import React, { ChangeEvent } from 'react';
import { unstable_usePrompt } from 'react-router-dom';

import { useCheckAccess } from 'components/common/Can';
import FormikUIPredefinedMessagesTextField, {
  PredefinedMessageKey,
} from 'components/common/predefinedMessages/FormikUIPredefinedMessagesTextField';
import {
  InstrumentWithManagementTime,
  ProposalEndStatus,
  UserRole,
} from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';

export type AdministrationFormData = {
  proposalPk: number;
  commentForUser: string;
  commentForManagement: string;
  finalStatus: ProposalEndStatus;
  managementTimeAllocations: {
    instrumentId: number;
    value: number;
  }[];
  managementDecisionSubmitted?: boolean;
};

type ProposalAdminProps = {
  data: ProposalData;
  setAdministration: (data: AdministrationFormData) => void;
};

const ProposalAdmin = ({ data, setAdministration }: ProposalAdminProps) => {
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const formik = useFormikContext();

  // TODO: Test this prompt
  unstable_usePrompt({
    message:
      'Changes you recently made in this tab will be lost! Are you sure?',
    when: ({ currentLocation, nextLocation }) =>
      formik.dirty &&
      formik.submitCount === 0 &&
      currentLocation.pathname !== nextLocation.pathname,
  });

  const initialValues = {
    proposalPk: data.primaryKey,
    finalStatus: data.finalStatus || ProposalEndStatus.UNSET,
    commentForUser: data.commentForUser || '',
    commentForManagement: data.commentForManagement || '',
    managementDecisionSubmitted: data.managementDecisionSubmitted,
    managementTimeAllocations:
      data.instruments?.map((instrument) => ({
        instrumentId: (instrument as InstrumentWithManagementTime).id,
        value:
          (instrument as InstrumentWithManagementTime)
            .managementTimeAllocation ?? '',
      })) || [],
  };

  const statusOptions: Option[] = [
    { text: 'Unset', value: ProposalEndStatus.UNSET },
    { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
    { text: 'Reserved', value: ProposalEndStatus.RESERVED },
    { text: 'Rejected', value: ProposalEndStatus.REJECTED },
  ];

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
        onSubmit={async (values): Promise<void> => {
          if (!values.managementTimeAllocations) {
            return;
          }

          const administrationValues = {
            proposalPk: data.primaryKey,
            finalStatus:
              ProposalEndStatus[values.finalStatus as ProposalEndStatus],
            commentForUser: values.commentForUser,
            commentForManagement: values.commentForManagement,
            managementTimeAllocations: values.managementTimeAllocations,
            managementDecisionSubmitted: values.managementDecisionSubmitted,
          };

          await handleProposalAdministration(
            administrationValues as AdministrationFormData
          );
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <Grid container spacing={2} alignItems="center">
              <Grid item sm={6} xs={12}>
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
              <Grid item sm={6} xs={12}>
                <FieldArray
                  name="managementTimeAllocations"
                  render={(arrayHelpers) =>
                    data.instruments?.map((instrument, index) => (
                      <Field
                        key={index}
                        name={`managementTimeAllocations[${index}]`}
                        label={`Management time allocation(${data.call?.allocationTimeUnit}s)`}
                        id="time-managemment-input"
                        type="number"
                        component={TextField}
                        value={values.managementTimeAllocations[index].value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (instrument) {
                            arrayHelpers.replace(index, {
                              value: e.target.value ? +e.target.value : '',
                              instrumentId: instrument.id,
                            });
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {instrument?.name}:
                            </InputAdornment>
                          ),
                          inputProps: { min: 0, max: 1e5 },
                        }}
                        fullWidth
                        autoComplete="off"
                        data-cy={`managementTimeAllocation-${instrument?.id}`}
                        disabled={!isUserOfficer || isSubmitting}
                        required
                      />
                    ))
                  }
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
                  {/* <Field
                    id="managementDecisionSubmitted"
                    name="managementDecisionSubmitted"
                    component={CheckboxWithLabel}
                    type="checkbox"
                    Label={{
                      label: 'Submitted',
                    }}
                    data-cy="is-management-decision-submitted"
                    disabled={!isUserOfficer || isSubmitting}
                  /> */}
                  <Field
                    id="managementDecisionSubmitted"
                    name="managementDecisionSubmitted"
                    component={Checkbox}
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
