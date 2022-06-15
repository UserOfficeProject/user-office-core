import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { updateProposalWorkflowValidationSchema } from '@user-office-software/duo-validation/lib/ProposalWorkflow';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { ProposalWorkflow } from 'generated/sdk';
import { StyledButtonContainer } from 'styles/StyledComponents';

import { Event, EventType } from './ProposalWorkflowEditorModel';

const useStyles = makeStyles((theme) => ({
  workflowName: {
    fontSize: '24px',
    fontWeight: 'bold',
    paddingBottom: '5px',
  },
  workflowDescription: {
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
  },
  container: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  button: {
    margin: '25px 10px 0 10px',
    '&:first-child': {
      marginLeft: '0',
    },
    '&:last-child': {
      marginRight: '0',
    },
  },
}));
const ProposalWorkflowMetadataEditor: React.FC<{
  proposalWorkflow: ProposalWorkflow;
  dispatch: React.Dispatch<Event>;
}> = ({ proposalWorkflow, dispatch }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const classes = useStyles();

  const staticJSX = (
    <div data-cy="proposal-workflow-metadata-container">
      <div className={classes.workflowName}>{proposalWorkflow.name}</div>
      <div className={classes.workflowDescription}>
        {proposalWorkflow.description}
      </div>
      <StyledButtonContainer>
        <Button
          startIcon={<EditIcon />}
          onClick={() => setIsEditMode(true)}
          className={classes.button}
          data-cy="Edit-button"
        >
          Edit
        </Button>
      </StyledButtonContainer>
    </div>
  );
  const inputJSX = (
    <Formik
      initialValues={proposalWorkflow}
      validationSchema={updateProposalWorkflowValidationSchema}
      onSubmit={async (values): Promise<void> => {
        dispatch({
          type: EventType.UPDATE_WORKFLOW_METADATA_REQUESTED,
          payload: { ...values, id: proposalWorkflow.id },
        });
        setIsEditMode(false);
      }}
    >
      {({ isSubmitting, handleChange, values }) => (
        <Form>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            value={values.name}
            onChange={handleChange}
            fullWidth
            data-cy="name"
          />

          <Field
            name="description"
            id="description"
            label="Description"
            type="text"
            component={TextField}
            value={values.description}
            onChange={handleChange}
            fullWidth
            data-cy="description"
          />
          <ActionButtonContainer>
            <Button
              disabled={isSubmitting}
              variant="text"
              color="secondary"
              onClick={() => setIsEditMode(false)}
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              data-cy="submit"
              type="submit"
              className={classes.button}
            >
              Update
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );

  const body = isEditMode ? inputJSX : staticJSX;

  return <Paper className={classes.container}>{body}</Paper>;
};

export default ProposalWorkflowMetadataEditor;
