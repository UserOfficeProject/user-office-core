import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { ProposalWorkflow } from 'generated/sdk';
import { ButtonContainer } from 'styles/StyledComponents';

import { Event, EventType } from './ProposalWorkflowEditorModel';

const ProposalWorkflowMetadataEditor: React.FC<{
  proposalWorkflow: ProposalWorkflow;
  dispatch: React.Dispatch<Event>;
}> = ({ proposalWorkflow, dispatch }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const classes = makeStyles(theme => ({
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
  }))();

  const staticJSX = (
    <div>
      <div className={classes.workflowName}>{proposalWorkflow.name}</div>
      <div className={classes.workflowDescription}>
        {proposalWorkflow.description}
      </div>
      <ButtonContainer>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setIsEditMode(true)}
          className={classes.button}
        >
          Edit
        </Button>
      </ButtonContainer>
    </div>
  );
  const inputJSX = (
    <Formik
      initialValues={proposalWorkflow}
      validationSchema={Yup.object().shape({
        name: Yup.string().min(1),
        description: Yup.string().nullable(),
      })}
      onSubmit={async values => {
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
            margin="normal"
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
            margin="normal"
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
              type="submit"
              variant="contained"
              color="primary"
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
