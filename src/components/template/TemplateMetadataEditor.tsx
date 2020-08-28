import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Template } from 'generated/sdk';
import { Event, EventType } from 'models/QuestionaryEditorModel';
import { ButtonContainer } from 'styles/StyledComponents';

export function TemplateMetadataEditor(props: {
  template: Template;
  dispatch: React.Dispatch<Event>;
}) {
  const { template, dispatch } = props;
  const [isEditMode, setIsEditMode] = useState(false);

  const classes = makeStyles(theme => ({
    templateName: {
      fontSize: '24px',
      fontWeight: 'bold',
      paddingBottom: '5px',
    },
    templateDescription: {
      fontSize: '16px',
      whiteSpace: 'pre-wrap',
    },
    container: {
      padding: theme.spacing(3),
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
      <div className={classes.templateName}>{template.name}</div>
      <div className={classes.templateDescription}>{template.description}</div>
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
      initialValues={template}
      validationSchema={Yup.object().shape({
        name: Yup.string().min(1),
        description: Yup.string().nullable(),
      })}
      onSubmit={async values => {
        dispatch({
          type: EventType.UPDATE_TEMPLATE_METADATA_REQUESTED,
          payload: { ...values, templateId: template.templateId },
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
}
