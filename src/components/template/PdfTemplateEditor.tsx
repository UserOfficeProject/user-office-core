import { TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';

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

  // TODO: get the template ID a better way
  const templateId = Number(window.location.pathname.split('/').pop());

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
                value={values.templateData}
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
