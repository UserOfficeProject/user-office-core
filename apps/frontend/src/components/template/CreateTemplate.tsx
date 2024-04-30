import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTemplateValidationSchema } from '@user-office-software/duo-validation/lib/Template';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';

import { TemplateGroupId, TemplateMetadataFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const CreateTemplate = (props: {
  onComplete: (template: TemplateMetadataFragment) => void;
  groupId: TemplateGroupId;
}) => {
  const { onComplete, groupId } = props;
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
          const { createTemplate } = await api().createTemplate({
            ...values,
            groupId,
          });
          onComplete(createTemplate);
        }}
        validationSchema={createTemplateValidationSchema}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field
              id="name-field"
              name="name"
              label="Name"
              component={TextField}
              fullWidth
              data-cy="name"
            />
            <Field
              id="description-field"
              name="description"
              label="Description"
              component={TextField}
              fullWidth
              multiline
              maxRows="16"
              minRows="3"
              data-cy="description"
            />
            <Button
              type="submit"
              fullWidth
              data-cy="submit"
              disabled={isSubmitting}
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
