import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { createTemplateValidationSchema } from '@user-office-software/duo-validation/lib/Template';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TemplateGroupId, TemplateMetadataFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const CreateTemplate = (props: {
  onComplete: (template: TemplateMetadataFragment) => void;
  groupId: TemplateGroupId;
}) => {
  const { onComplete, groupId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useDataApiWithFeedback();

  return (
    <>
      <Typography variant="h6" component="h1">
        Create new template
      </Typography>
      <Formik
        initialValues={{
          name: '',
          description: '',
        }}
        onSubmit={async (values): Promise<void> => {
          const result = await api().createTemplate({ ...values, groupId });
          const {
            createTemplate: { template, rejection },
          } = result;
          if (!template) {
            enqueueSnackbar(rejection?.reason ?? 'Unknown error', {
              variant: 'error',
            });
          } else {
            onComplete(template);
          }
        }}
        validationSchema={createTemplateValidationSchema}
      >
        {() => (
          <Form>
            <Field
              id="name-field"
              name="name"
              label="Name"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="name"
            />
            <Field
              id="description-field"
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
