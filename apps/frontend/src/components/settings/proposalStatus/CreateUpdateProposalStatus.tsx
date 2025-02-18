import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  createStatusValidationSchema,
  updateStatusValidationSchema,
} from '@user-office-software/duo-validation/lib/Statuses';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { Status, WorkflowType } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdateProposalStatusProps = {
  close: (proposalStatusAdded: Status | null) => void;
  proposalStatus: Status | null;
};

const CreateUpdateProposalStatus = ({
  close,
  proposalStatus,
}: CreateUpdateProposalStatusProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = proposalStatus
    ? proposalStatus
    : {
        shortCode: '',
        name: '',
        description: '',
        entityType: WorkflowType.PROPOSAL,
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (proposalStatus) {
          try {
            const { updateStatus } = await api({
              toastSuccessMessage: 'Proposal status updated successfully',
            }).updateStatus({
              id: proposalStatus.id,
              ...values,
            });

            close(updateStatus);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createStatus } = await api({
              toastSuccessMessage: 'Proposal status created successfully',
            }).createStatus(values);

            close(createStatus);
          } catch (error) {
            close(null);
          }
        }
      }}
      validationSchema={
        proposalStatus
          ? updateStatusValidationSchema
          : createStatusValidationSchema
      }
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            {proposalStatus ? 'Update' : 'Create new'} proposal status
          </Typography>
          <Field
            name="shortCode"
            id="shortCode"
            label="Short code"
            type="text"
            sx={{
              ...(!!initialValues.shortCode && {
                '& .MuiInputBase-root.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.7) !important',
                },
              }),
            }}
            component={TextField}
            fullWidth
            data-cy="shortCode"
            required
            disabled={!!initialValues.shortCode || isExecutingCall}
          />
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            fullWidth
            data-cy="name"
            disabled={isExecutingCall}
            required
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            disabled={isExecutingCall}
            required
          />

          <Button
            type="submit"
            fullWidth
            sx={(theme) => ({ margin: theme.spacing(3, 0, 2) })}
            data-cy="submit"
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            {proposalStatus ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUpdateProposalStatus.propTypes = {
  proposalStatus: PropTypes.any,
  close: PropTypes.func.isRequired,
};

export default CreateUpdateProposalStatus;
