import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createProposalWorkflowValidationSchema } from '@user-office-software/duo-validation/lib/ProposalWorkflow';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { ProposalWorkflow } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateProposalWorkflowProps = {
  close: (proposalWorkflowAdded: ProposalWorkflow | null) => void;
};

const CreateProposalWorkflow = ({ close }: CreateProposalWorkflowProps) => {
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
        try {
          const data = await api({
            toastSuccessMessage: 'Proposal workflow created successfully',
          }).createProposalWorkflow(values);

          close(data.createProposalWorkflow as ProposalWorkflow);
        } catch (error) {
          close(null);
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
            sx={(theme) => ({
              margin: theme.spacing(3, 0, 2),
            })}
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
