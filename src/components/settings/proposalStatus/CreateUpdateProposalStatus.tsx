import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
} from '@esss-swap/duo-validation/lib/ProposalStatuses';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { DarkerDisabledTextField } from 'components/common/DarkerDisabledTextField';
import UOLoader from 'components/common/UOLoader';
import { ProposalStatus } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(theme => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
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
      onSubmit={async (values, actions): Promise<void> => {
        if (proposalStatus) {
          const data = await api(
            'Proposal status updated successfully'
          ).updateProposalStatus({
            id: proposalStatus.id,
            ...values,
          });
          if (data.updateProposalStatus.error) {
            close(null);
          } else if (data.updateProposalStatus.proposalStatus) {
            close(data.updateProposalStatus.proposalStatus);
          }
        } else {
          const data = await api(
            'Proposal status created successfully'
          ).createProposalStatus(values);
          if (data.createProposalStatus.error) {
            close(null);
          } else if (data.createProposalStatus.proposalStatus) {
            close(data.createProposalStatus.proposalStatus);
          }
        }
        actions.setSubmitting(false);
      }}
      validationSchema={
        proposalStatus
          ? updateProposalStatusValidationSchema
          : createProposalStatusValidationSchema
      }
    >
      {() => (
        <Form>
          <Typography variant="h6">
            {proposalStatus ? 'Update' : 'Create new'} proposal status
          </Typography>
          <Field
            name="shortCode"
            id="shortCode"
            label="Short code"
            type="text"
            value={initialValues.shortCode ? initialValues.shortCode : ''}
            component={
              initialValues.shortCode ? DarkerDisabledTextField : TextField
            }
            margin="normal"
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
            margin="normal"
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
            margin="normal"
            fullWidth
            multiline
            rowsMax="16"
            rows="3"
            data-cy="description"
            disabled={isExecutingCall}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
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
