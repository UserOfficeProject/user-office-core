import { html } from '@codemirror/lang-html';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import CodeMirror from '@uiw/react-codemirror';
import { Field, FieldProps, Form, Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import SimpleTabs from 'components/common/SimpleTabs';
import UOLoader from 'components/common/UOLoader';
import { PdfTemplate, Template } from 'generated/sdk';
import { usePersistQuestionaryEditorModel } from 'hooks/questionary/usePersistQuestionaryEditorModel';
import QuestionaryEditorModel from 'models/questionary/QuestionaryEditorModel';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PDFTemplateDocumentation from './documentation';
import PdfTemplateEditorViewer from './PdfTemplateEditorViewer';
import { TemplateMetadataEditor } from './TemplateMetadataEditor';
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
  Type extends
    | 'templateData'
    | 'templateHeader'
    | 'templateFooter'
    | 'templateSampleDeclaration'
    | 'dummyData',
>({
  name,
  template,
  initialValues,
  pdfTemplate,
  setPdfTemplate,
}: ITemplateEditorProps<Type>) => {
  const { api } = useDataApiWithFeedback();

  const { persistModel } = usePersistQuestionaryEditorModel();
  const { state, dispatch } = QuestionaryEditorModel([persistModel]);

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        {template?.name}
      </Typography>
      <TemplateMetadataEditor dispatch={dispatch} template={state} />
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
                    maxHeight="60vh"
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
  const [editorWidth, setEditorWidth] = useState(50);
  const pdfEditorContainerRef = useRef<HTMLDivElement>(null);
  const { templateId } = useParams<{
    templateId: string;
  }>();
  useEffect(() => {
    if (!templateId) {
      return;
    }

    api()
      .getTemplate({ templateId: parseInt(templateId) })
      .then(({ template }) => {
        setTemplate(template as Template);
        setPdfTemplate(template?.pdfTemplate as PdfTemplate);
        setLoading(false);
      });
  }, [api, templateId]);

  const handleMouseMove = (e: MouseEvent) => {
    if (pdfEditorContainerRef.current) {
      const windowWidth = window.innerWidth; // Total width of the window
      const containerWidth = pdfEditorContainerRef.current.offsetWidth; // Width of the container
      const sidebarWidth = windowWidth - containerWidth; // Width of the sidebar

      const newEditorWidth =
        ((e.clientX - sidebarWidth) / containerWidth) * 100;
      setEditorWidth(newEditorWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return loading ? (
    <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: '90vh',
        }}
        ref={pdfEditorContainerRef}
      >
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
            width: `${editorWidth}%`,
            overflow: 'auto',
          }}
        >
          {template && pdfTemplate && (
            <SimpleTabs
              tabNames={[
                'Body',
                'Header',
                'Footer',
                'Sample Declaration',
                'Dummy Data',
              ]}
            >
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
              <TemplateEditor<'templateSampleDeclaration'>
                name="templateSampleDeclaration"
                template={template}
                initialValues={{
                  templateSampleDeclaration:
                    pdfTemplate?.templateSampleDeclaration,
                }}
                pdfTemplate={pdfTemplate}
                setPdfTemplate={setPdfTemplate}
              />
              <TemplateEditor<'dummyData'>
                name="dummyData"
                template={template}
                initialValues={{
                  dummyData: pdfTemplate?.dummyData,
                }}
                pdfTemplate={pdfTemplate}
                setPdfTemplate={setPdfTemplate}
              />
            </SimpleTabs>
          )}
        </Box>
        <Box
          sx={{
            cursor: 'ew-resize',
            width: '15px',
          }}
          onMouseDown={handleMouseDown}
        />
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
            width: `${100 - editorWidth}%`,
            overflow: 'auto',
          }}
        >
          {pdfTemplate && <PdfTemplateEditorViewer pdfTemplate={pdfTemplate} />}
        </Box>
      </Box>
    </>
  );
}
