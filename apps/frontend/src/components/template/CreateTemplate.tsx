import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTemplateValidationSchema } from '@user-office-software/duo-validation/lib/Template';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import TextField from 'components/common/FormikUITextField';
import { TemplateGroupId, TemplateMetadataFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import {
  body as defaultProposalBody,
  header as defaultProposalHeader,
  footer as defaultProposalFooter,
  sampleDeclaration as defaultProposalSampleDeclaration,
  dummyData as defaultProposalDummyData,
} from './PdfTemplateDefaultData';

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

          if (
            createTemplate.groupId == TemplateGroupId.PDF_TEMPLATE &&
            createTemplate.pdfTemplate
          ) {
            await api({
              toastSuccessMessage: 'Template updated successfully!',
            }).updatePdfTemplate({
              pdfTemplateId: createTemplate.pdfTemplate.pdfTemplateId,
              templateData: defaultProposalBody,
              templateHeader: defaultProposalHeader,
              templateFooter: defaultProposalFooter,
              templateSampleDeclaration: defaultProposalSampleDeclaration,
              dummyData: defaultProposalDummyData,
            });
          }

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
