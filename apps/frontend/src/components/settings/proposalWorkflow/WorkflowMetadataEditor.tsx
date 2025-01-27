import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { updateProposalWorkflowValidationSchema } from '@user-office-software/duo-validation/lib/ProposalWorkflow';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import { Workflow } from 'generated/sdk';
import { StyledButtonContainer } from 'styles/StyledComponents';

import { Event, EventType } from './WorkflowEditorModel';

const WorkflowMetadataEditor = ({
  workflow,
  dispatch,
}: {
  workflow: Workflow;
  dispatch: React.Dispatch<Event>;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const staticJSX = (
    <div data-cy="workflow-metadata-container">
      <Box sx={{ fontSize: '24px', fontWeight: 'bold', paddingBottom: '5px' }}>
        {workflow.name}
      </Box>
      <Box sx={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>
        {workflow.description}
      </Box>
      <StyledButtonContainer>
        <Button
          startIcon={<EditIcon />}
          onClick={() => setIsEditMode(true)}
          sx={{
            margin: '25px 10px 0 10px',
            '&:first-child': {
              marginLeft: '0',
            },
            '&:last-child': {
              marginRight: '0',
            },
          }}
          data-cy="Edit-button"
        >
          Edit
        </Button>
      </StyledButtonContainer>
    </div>
  );
  const inputJSX = (
    <Formik
      initialValues={workflow}
      validationSchema={updateProposalWorkflowValidationSchema}
      onSubmit={async (values): Promise<void> => {
        dispatch({
          type: EventType.UPDATE_WORKFLOW_METADATA_REQUESTED,
          payload: { ...values, id: workflow.id },
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
              sx={{
                margin: '25px 10px 0 10px',
                '&:first-child': {
                  marginLeft: '0',
                },
                '&:last-child': {
                  marginRight: '0',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              data-cy="submit"
              type="submit"
              sx={{
                margin: '25px 10px 0 10px',
                '&:first-child': {
                  marginLeft: '0',
                },
                '&:last-child': {
                  marginRight: '0',
                },
              }}
            >
              Update
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );

  const body = isEditMode ? inputJSX : staticJSX;

  return (
    <Paper
      sx={(theme) => ({
        padding: theme.spacing(3),
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
      })}
    >
      {body}
    </Paper>
  );
};

export default WorkflowMetadataEditor;
