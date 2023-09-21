import { html } from '@codemirror/lang-html';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import CodeMirror from '@uiw/react-codemirror';
import { Field, FieldProps, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import { PdfTemplate, Template } from 'generated/sdk';
import {
  StyledButtonContainer,
  StyledContainer,
  StyledPaper,
} from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PDFTemplateDocumentation from './documentation';
interface ITemplateEditorProps<Type extends string> {
  name: Type;
  template: Template | null;
  initialValues: {
    [key in Type]: string | null;
  };
  pdfTemplate: PdfTemplate | null;
  setPdfTemplate: React.Dispatch<React.SetStateAction<PdfTemplate | null>>;
}
const TemplateEditor = <
  Type extends 'templateData' | 'templateHeader' | 'templateFooter'
>({
  name,
  template,
  initialValues,
  pdfTemplate,
  setPdfTemplate,
}: ITemplateEditorProps<Type>) => {
  const { api } = useDataApiWithFeedback();

  return (
    <>
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
                setPdfTemplate(template.updatePdfTemplate as PdfTemplate);
              });
          }
        }}
      >
        {({ setFieldValue }) => (
          <Form>
            <Field name={name}>
              {({ field }: FieldProps<string>) => (
                <Box sx={{ my: 3 }}>
                  <CodeMirror
                    minHeight="200px"
                    maxHeight="600px"
                    extensions={[html()]}
                    onChange={(value) => {
                      setFieldValue(name, value);
                    }}
                    value={field.value}
                    data-cy={name}
                  />
                </Box>
              )}
            </Field>
            <StyledButtonContainer>
              <PDFTemplateDocumentation />
              <Button type="submit" data-cy={`${name}-submit`}>
                Update
              </Button>
            </StyledButtonContainer>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default function PdfTemplateEditor() {
  const { api } = useDataApiWithFeedback();
  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate | null>(null);

  const { templateId: templateIdQueryParam } = useParams<{
    templateId: string;
  }>();
  const templateId = parseInt(templateIdQueryParam);

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
        {template && pdfTemplate && (
          <SimpleTabs tabNames={['Body', 'Header', 'Footer']}>
            <TemplateEditor<'templateData'>
              name="templateData"
              template={template}
              initialValues={{
                templateData: pdfTemplate?.templateData,
              }}
              pdfTemplate={pdfTemplate}
              setPdfTemplate={setPdfTemplate}
            />
            <TemplateEditor<'templateHeader'>
              name="templateHeader"
              template={template}
              initialValues={{
                templateHeader: pdfTemplate?.templateHeader,
              }}
              pdfTemplate={pdfTemplate}
              setPdfTemplate={setPdfTemplate}
            />
            <TemplateEditor<'templateFooter'>
              name="templateFooter"
              template={template}
              initialValues={{
                templateFooter: pdfTemplate?.templateFooter,
              }}
              pdfTemplate={pdfTemplate}
              setPdfTemplate={setPdfTemplate}
            />
          </SimpleTabs>
        )}
      </StyledPaper>
    </StyledContainer>
  );
}
