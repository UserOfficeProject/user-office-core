import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { createTemplateValidationSchema } from '@esss-swap/duo-validation';
import { Container, TextField, Button, Typography } from '@material-ui/core';
import { Formik, Field, Form } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import {
  TemplateCategoryId,
  TemplateMetadataFragment,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';

const CreateTemplate = (props: {
  onComplete: (template: TemplateMetadataFragment | null) => void;
  categoryId: TemplateCategoryId;
}) => {
  const { onComplete: complete, categoryId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();
  return (
    <>
      <Typography variant="h6">Create template</Typography>
      <Formik
        initialValues={{
          name: '',
          description: '',
        }}
        onSubmit={async values => {
          const result = await api().createTemplate({ ...values, categoryId });
          const {
            createTemplate: { template, error },
          } = result;

          if (error) {
            enqueueSnackbar(getTranslation(error as ResourceId), {
              variant: 'error',
            });
          }
          complete(template);
        }}
        validationSchema={createTemplateValidationSchema}
      >
        {({ values, errors, handleChange, touched }): JSX.Element => (
          <Form>
            <Field
              name="name"
              id="name"
              label="Name"
              type="text"
              value={values.name}
              onChange={handleChange}
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="name"
              error={touched.name && errors.name !== undefined}
              helperText={touched.name && errors.name && errors.name}
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
              onChange={handleChange}
              value={values.description}
              data-cy="description"
              error={touched.description && errors.description !== undefined}
              helperText={
                touched.description && errors.description && errors.description
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              data-cy="submit"
            >
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateTemplate;
