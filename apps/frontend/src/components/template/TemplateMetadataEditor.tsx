import { Check, Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import TextField from 'components/common/FormikUITextField';
import { Template } from 'generated/sdk';
import { Event, EventType } from 'models/questionary/QuestionaryEditorModel';

export function TemplateMetadataEditor(props: {
  template: Template;
  dispatch: React.Dispatch<Event>;
}) {
  const { template, dispatch } = props;
  const [isEditMode, setIsEditMode] = useState(false);

  const theme = useTheme();

  const staticJSX = (
    <div onClick={() => setIsEditMode(true)} data-cy="edit-metadata">
      <InputLabel
        sx={{
          color: theme.palette.grey[900],
          fontSize: 'small',
          margin: '5px 0 0 0',
        }}
      >
        Name
      </InputLabel>
      <Box
        sx={{
          fontSize: '24px',
          fontWeight: 'bold',
          paddingBottom: '10px',
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
        }}
      >
        {template.name}
        <EditIcon fontSize="small" />
      </Box>

      <InputLabel
        sx={{
          color: theme.palette.grey[900],
          fontSize: 'small',
          margin: '5px 0 0 0',
        }}
      >
        Description
      </InputLabel>
      <Box
        sx={{
          fontSize: '16px',
          whiteSpace: 'pre-wrap',
          paddingBottom: '5px',
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
        }}
      >
        {template.description}
        <EditIcon fontSize="small" />
      </Box>
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
            sx={{ margin: '5px 0 10px 0' }}
            value={values.name}
            onChange={handleChange}
            fullWidth
            InputProps={{ 'data-cy': 'template-name' }}
          />

          <Field
            name="description"
            id="description"
            label="Description"
            type="text"
            component={TextField}
            sx={{ margin: '5px 0 10px 0' }}
            value={values.description}
            onChange={handleChange}
            fullWidth
            InputProps={{ 'data-cy': 'template-description' }}
          />
          <ActionButtonContainer sx={{ margin: `${theme.spacing(1)} 0 0 0` }}>
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

  return (
    <Paper sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(3) }}>
      {body}
    </Paper>
  );
}
