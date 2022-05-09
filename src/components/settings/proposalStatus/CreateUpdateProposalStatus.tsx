import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
} from '@user-office-software/duo-validation/lib/ProposalStatuses';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { ProposalStatus } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  darkerDisabledTextField: {
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.7) !important',
    },
  },
}));

type CreateUpdateProposalStatusProps = {
  close: (proposalStatusAdded: ProposalStatus | null) => void;
  proposalStatus: ProposalStatus | null;
};

const CreateUpdateProposalStatus: React.FC<CreateUpdateProposalStatusProps> = ({
  close,
  proposalStatus,
}) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = proposalStatus
    ? proposalStatus
    : {
        shortCode: '',
        name: '',
        description: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (proposalStatus) {
          const data = await api({
            toastSuccessMessage: 'Proposal status updated successfully',
          }).updateProposalStatus({
            id: proposalStatus.id,
            ...values,
          });
          if (data.updateProposalStatus.rejection) {
            close(null);
          } else if (data.updateProposalStatus.proposalStatus) {
            close(data.updateProposalStatus.proposalStatus);
          }
        } else {
          const data = await api({
            toastSuccessMessage: 'Proposal status created successfully',
          }).createProposalStatus(values);
          if (data.createProposalStatus.rejection) {
            close(null);
          } else if (data.createProposalStatus.proposalStatus) {
            close(data.createProposalStatus.proposalStatus);
          }
        }
      }}
      validationSchema={
        proposalStatus
          ? updateProposalStatusValidationSchema
          : createProposalStatusValidationSchema
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
            component={TextField}
            className={
              !!initialValues.shortCode ? classes.darkerDisabledTextField : ''
            }
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
            className={classes.submit}
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
