import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { createProposalWorkflowValidationSchema } from '@user-office-software/duo-validation/lib/ProposalWorkflow';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { ProposalWorkflow } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
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
      onSubmit={async (values): Promise<void> => {
        const data = await api({
          toastSuccessMessage: 'Proposal workflow created successfully',
        }).createProposalWorkflow(values);
        if (data.createProposalWorkflow.rejection) {
          close(null);
        } else if (data.createProposalWorkflow.proposalWorkflow) {
          close(data.createProposalWorkflow.proposalWorkflow);
        }
      }}
      validationSchema={createProposalWorkflowValidationSchema}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            Create new proposal workflow
          </Typography>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
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
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            disabled={isExecutingCall}
          />

          <Button
            type="submit"
            fullWidth
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
