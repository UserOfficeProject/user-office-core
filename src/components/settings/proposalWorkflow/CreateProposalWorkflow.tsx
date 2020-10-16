import { createProposalWorkflowValidationSchema } from '@esss-swap/duo-validation/lib/ProposalWorkflow';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { ProposalWorkflow } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles(theme => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateProposalWorkflowProps = {
  close: (proposalWorkflowAdded: ProposalWorkflow | null) => void;
};

const CreateProposalWorkflow: React.FC<CreateProposalWorkflowProps> = ({
  close,
}) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = {
    name: '',
    description: '',
    proposalWorkflowConnections: [],
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions): Promise<void> => {
        const data = await api(
          'Proposal workflow created successfully'
        ).createProposalWorkflow(values);
        if (data.createProposalWorkflow.error) {
          close(null);
        } else if (data.createProposalWorkflow.proposalWorkflow) {
          close(data.createProposalWorkflow.proposalWorkflow);
        }

        actions.setSubmitting(false);
      }}
      validationSchema={createProposalWorkflowValidationSchema}
    >
      {() => (
        <Form>
          <Typography variant="h6">Create new proposal workflow</Typography>
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
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateProposalWorkflow.propTypes = {
  close: PropTypes.func.isRequired,
};

export default CreateProposalWorkflow;
