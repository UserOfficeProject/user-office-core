import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { createTemplateValidationSchema } from '@esss-swap/duo-validation/lib/Template';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TemplateCategoryId, TemplateMetadataFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

const CreateTemplate = (props: {
  onComplete: (template: TemplateMetadataFragment | null | undefined) => void;
  categoryId: TemplateCategoryId;
}) => {
  const { onComplete, categoryId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();

  return (
    <>
      <Typography variant="h6">Create new template</Typography>
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
          onComplete(template);
        }}
        validationSchema={createTemplateValidationSchema}
      >
        {() => (
          <Form>
            <Field
              name="name"
              label="Name"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="name"
            />
            <Field
              name="description"
              label="Description"
              component={TextField}
              margin="normal"
              fullWidth
              multiline
              rowsMax="16"
              rows="3"
              data-cy="description"
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
