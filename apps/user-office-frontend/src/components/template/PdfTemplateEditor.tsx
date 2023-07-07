import { html } from '@codemirror/lang-html';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  TableCell,
  TableRow,
  Theme,
  Typography,
  createStyles,
} from '@mui/material';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/styles';
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

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    })
  )(TableRow);
  const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
      head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      body: {
        fontSize: 14,
      },
    })
  )(TableCell);

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
              <Button sx={{ mr: 2 }} onClick={handleClickOpen}>
                Help
              </Button>
              <Button type="submit" data-cy={`${name}-submit`}>
                Update
              </Button>
              <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="xl"
              >
                <DialogContent dividers>
                  <h1>PDF Template Help</h1>
                  <Typography gutterBottom color="inherit" variant="body1">
                    Here are the variables, that you can use in the editor using
                    double bracket notation
                    <hr />
                    <h2>Object: Proposal</h2>
                    <h4>proposal.title</h4>
                    <span>Returns the name of the Proposal</span>
                    <h4>proposal.proposalId</h4>
                    <span>Returns the Proposal Number</span>
                    <h4>proposal.abstract</h4>
                    <span>Returns the abstract of the Proposal</span>
                    <hr />
                    <h2>Object: userRole</h2>
                    <h4>userRole.shortCode</h4>
                    <span>Returns the shortCode of the userRole</span>
                    <hr />
                    <h2>Object: principalInvestigator</h2>
                    <h4>principalInvestigator.firstname</h4>
                    <span>
                      Returns the first name of the Principal Investigator
                    </span>
                    <h4>principalInvestigator.lastname</h4>
                    <span>
                      Returns the last name of the Principal Investigator
                    </span>
                    <h4>principalInvestigator.position</h4>
                    <span>
                      Returns the position of the Principal Investigator
                    </span>
                    <h4>principalInvestigator.organization</h4>
                    <span>
                      Returns the organization name of the Principal
                      Investigator
                    </span>
                    <hr />
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus onClick={handleClose} variant="text">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
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
