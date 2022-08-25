import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { PdfTemplate, Template } from 'generated/sdk';
import {
  StyledButtonContainer,
  StyledContainer,
  StyledPaper,
} from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export default function PdfTemplateEditor() {
  const { api } = useDataApiWithFeedback();
  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate | null>(null);

  const { templateId: templateIdQueryParam } = useParams<{
    templateId: string;
  }>();
  const templateId = parseInt(templateIdQueryParam);

  const initialValues = {
    templateData: pdfTemplate?.templateData,
  };

  useEffect(() => {
    api()
      .getTemplate({ templateId })
      .then(({ template }) => {
        setTemplate(template as Template);
        setPdfTemplate(template?.pdfTemplate as PdfTemplate);
        setLoading(false);
      });
  }, [api, templateId]);

  return loading ? (
    <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
  ) : (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h6" component="h2" gutterBottom>
          {template?.name}
        </Typography>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values): Promise<void> => {
            if (pdfTemplate) {
              await api({
                toastSuccessMessage: 'Template updated successfully!',
              })
                .updatePdfTemplate({
                  ...values,
                  pdfTemplateId: pdfTemplate?.pdfTemplateId,
                })
                .then((template) => {
                  setPdfTemplate(
                    template.updatePdfTemplate.pdfTemplate as PdfTemplate
                  );
                });
            }
          }}
        >
          {({ handleChange, values }) => (
            <Form>
              <Field
                name="templateData"
                id="templateData"
                label="Template contents"
                type="text"
                component={TextField}
                data-cy="template-data"
                fullWidth
                multiline
                minRows={10}
                variant="outlined"
                onChange={handleChange}
              />
              <StyledButtonContainer>
                <Button type="submit" data-cy="submit">
                  {'Update'}
                </Button>
              </StyledButtonContainer>
            </Form>
          )}
        </Formik>
      </StyledPaper>
    </StyledContainer>
  );
}
