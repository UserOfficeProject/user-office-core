import { Check, Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },

  label: {
    color: theme.palette.grey[900],
    fontSize: 'small',
    margin: '5px 0 0 0',
  },
  templateName: {
    fontSize: '24px',
    fontWeight: 'bold',
    paddingBottom: '10px',
  },
  templateDescription: {
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
    paddingBottom: '5px',
  },

  inputField: {
    margin: '5px 0 10px 0',
  },

  editableField: {
    cursor: 'pointer',
    '& > svg': {
      color: 'transparent',
      marginLeft: theme.spacing(1),
      transition: '300ms',
    },
    '&:hover': {
      '& > svg': {
        color: theme.palette.grey[600],
      },
    },
  },
  StyledButtonContainer: {
    margin: `${theme.spacing(1)} 0 0 0`,
  },
}));
export function TemplateMetadataEditor(props: {
  template: Template;
  dispatch: React.Dispatch<Event>;
}) {
  const { template, dispatch } = props;
  const [isEditMode, setIsEditMode] = useState(false);

  const classes = useStyles();

  const staticJSX = (
    <div onClick={() => setIsEditMode(true)} data-cy="edit-metadata">
      <label className={classes.label}>Name</label>
      <div className={clsx(classes.templateName, classes.editableField)}>
        {template.name}
        <EditIcon fontSize="small" />
      </div>

      <label className={classes.label}>Description</label>
      <div className={clsx(classes.templateDescription, classes.editableField)}>
        {template.description}
        <EditIcon fontSize="small" />
      </div>
    </div>
  );
  const inputJSX = (
    <Formik
      initialValues={template}
      validationSchema={Yup.object().shape({
        name: Yup.string().min(1),
        description: Yup.string().nullable(),
      })}
      onSubmit={async (values): Promise<void> => {
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
            className={classes.inputField}
            fullWidth
            InputProps={{ 'data-cy': 'template-name' }}
          />

          <Field
            name="description"
            id="description"
            label="Description"
            type="text"
            component={TextField}
            value={values.description}
            onChange={handleChange}
            className={classes.inputField}
            fullWidth
            InputProps={{ 'data-cy': 'template-description' }}
          />
          <ActionButtonContainer className={classes.StyledButtonContainer}>
            <IconButton
              disabled={isSubmitting}
              onClick={() => setIsEditMode(false)}
            >
              <Close />
            </IconButton>

            <IconButton
              disabled={isSubmitting}
              type="submit"
              data-cy="save-metadata-btn"
            >
              <Check />
            </IconButton>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );

  const body = isEditMode ? inputJSX : staticJSX;

  return <Paper className={classes.container}>{body}</Paper>;
}
