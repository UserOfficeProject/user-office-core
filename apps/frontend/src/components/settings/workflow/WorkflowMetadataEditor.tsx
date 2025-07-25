import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/system';
import { updateWorkflowValidationSchema } from '@user-office-software/duo-validation/lib/Workflow';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { ConnectionLineType } from 'reactflow';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import FormikUISelect from 'components/common/FormikUISelect';
import FormikUITextField from 'components/common/FormikUITextField';
import { Workflow } from 'generated/sdk';
import { StyledButtonContainer } from 'styles/StyledComponents';

import { Event, EventType } from './WorkflowEditorModel';

// Connection line type options for the dropdown
const CONNECTION_LINE_TYPE_OPTIONS = [
  { value: ConnectionLineType.Bezier, text: 'Bezier' },
  { value: ConnectionLineType.Straight, text: 'Straight' },
  { value: ConnectionLineType.Step, text: 'Step' },
  { value: ConnectionLineType.SmoothStep, text: 'Smooth Step' },
  { value: ConnectionLineType.SimpleBezier, text: 'Simple Bezier' },
];

const StyledButton = styled(Button)({
  margin: '25px 10px 0 10px',
  '&:first-of-type': {
    marginLeft: '0',
  },
  '&:last-of-type': {
    marginRight: '0',
  },
});

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
        <StyledButton
          startIcon={<EditIcon />}
          onClick={() => setIsEditMode(true)}
          data-cy="Edit-button"
        >
          Edit
        </StyledButton>
      </StyledButtonContainer>
    </div>
  );
  const inputJSX = (
    <Formik
      initialValues={workflow}
      validationSchema={updateWorkflowValidationSchema}
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
            text="Name"
            type="text"
            component={FormikUITextField}
            value={values.name}
            onChange={handleChange}
            fullWidth
            data-cy="name"
          />

          <Field
            name="description"
            id="description"
            text="Description"
            type="text"
            component={FormikUITextField}
            value={values.description}
            onChange={handleChange}
            fullWidth
            data-cy="description"
          />

          <Field
            name="connectionLineType"
            id="connectionLineType"
            text="Connection Line Type"
            component={FormikUISelect}
            value={values.connectionLineType || ConnectionLineType.Bezier}
            options={CONNECTION_LINE_TYPE_OPTIONS}
            onChange={handleChange}
            fullWidth
            data-cy="connectionLineType"
          />
          <ActionButtonContainer>
            <StyledButton
              disabled={isSubmitting}
              variant="text"
              color="secondary"
              onClick={() => setIsEditMode(false)}
            >
              Cancel
            </StyledButton>
            <StyledButton
              disabled={isSubmitting}
              data-cy="submit"
              type="submit"
            >
              Update
            </StyledButton>
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
