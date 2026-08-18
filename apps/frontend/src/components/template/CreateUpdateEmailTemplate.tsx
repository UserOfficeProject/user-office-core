import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CodeMirror from '@uiw/react-codemirror';
import {
  createEmailTemplateValidationSchema,
  updateEmailTemplateValidationSchema,
} from '@user-office-software/duo-validation';
import { Field, FieldProps, Form, Formik } from 'formik';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import i18n from 'i18n';

import { pugLanguage } from 'components/common/codeMirrorPug';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import SimpleTabs from 'components/common/SimpleTabs';
import UOLoader from 'components/common/UOLoader';
import { EmailTemplateFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import EmailTemplatePreview from './EmailTemplatePreview';

type CreateUpdateEmailTemplateProps = {
  close: (emailTemplateAdded: EmailTemplateFragment | null) => void;
  emailTemplate: EmailTemplateFragment | null;
};

const CreateUpdateEmailTemplate = ({
  close,
  emailTemplate,
}: CreateUpdateEmailTemplateProps) => {
  const { t } = useTranslation();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [, setSearchParams] = useSearchParams();
  const didResetModalTab = useRef(false);

  useEffect(() => {
    if (didResetModalTab.current) {
      return;
    }

    didResetModalTab.current = true;

    setSearchParams(
      (searchParam) => {
        if (!searchParam.has('modalTab')) {
          return searchParam;
        }

        const next = new URLSearchParams(searchParam);
        next.delete('modalTab');

        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const initialValues = emailTemplate
    ? emailTemplate
    : {
        name: '',
        description: '',
        useTemplateFile: false,
        subject: '',
        body: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (emailTemplate) {
          try {
            const { updateEmailTemplate } = await api({
              toastSuccessMessage: 'Email template updated successfully!',
            }).updateEmailTemplate({ id: emailTemplate.id, ...values });

            close(updateEmailTemplate);
          } catch {
            close(null);
          }
        } else {
          try {
            const { createEmailTemplate } = await api({
              toastSuccessMessage: 'Email template created successfully!',
            }).createEmailTemplate(values);

            close(createEmailTemplate);
          } catch {
            close(null);
          }
        }
      }}
      validationSchema={
        !!emailTemplate
          ? updateEmailTemplateValidationSchema
          : createEmailTemplateValidationSchema
      }
    >
      {({ isValid, values, setFieldValue, setFieldTouched }) => {
        const bodyDisabled = isExecutingCall || values.useTemplateFile;

        return (
          <Form>
            <Typography variant="h6" component="h1">
              {(emailTemplate ? 'Update ' : 'Create new ') +
                i18n.format(t('Email template'), 'lowercase')}
            </Typography>

            <SimpleTabs
              tabNames={['Edit', 'Preview']}
              isInsideModal
              tabPanelPadding={1}
            >
              <Box>
                <Field
                  name="name"
                  id="name"
                  label="Name"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="name"
                  disabled={isExecutingCall}
                  required
                />
                <Field
                  name="description"
                  id="description"
                  label="Description"
                  type="text"
                  component={TextField}
                  multiline
                  fullWidth
                  data-cy="description"
                  disabled={isExecutingCall}
                  required
                />
                <Field
                  id="useTemplateFile"
                  name="useTemplateFile"
                  Label={{
                    label: 'Use Template File',
                  }}
                  type="checkbox"
                  component={CheckboxWithLabel}
                  data-cy="use-template-file"
                  disabled={isExecutingCall}
                />
                <Field
                  name="subject"
                  id="subject"
                  label="Subject"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="subject"
                  disabled={isExecutingCall || values.useTemplateFile}
                />
                <Field name="body">
                  {({ field }: FieldProps<string>) => (
                    <Box
                      sx={{ mt: 2, opacity: bodyDisabled ? 0.6 : 1 }}
                      data-cy="body"
                    >
                      <InputLabel shrink>Body (Pug)</InputLabel>
                      <CodeMirror
                        value={field.value ?? ''}
                        minHeight="200px"
                        maxHeight="45vh"
                        extensions={[pugLanguage]}
                        editable={!bodyDisabled}
                        readOnly={bodyDisabled}
                        onChange={(value) => setFieldValue('body', value)}
                        onBlur={() => setFieldTouched('body', true)}
                      />
                    </Box>
                  )}
                </Field>
              </Box>

              <EmailTemplatePreview
                emailTemplateId={emailTemplate?.id}
                subject={values.subject ?? ''}
                body={values.body ?? ''}
                useTemplateFile={values.useTemplateFile}
              />
            </SimpleTabs>

            <Button
              type="submit"
              sx={{ marginTop: 2 }}
              fullWidth
              data-cy="submit"
              disabled={!isValid || isExecutingCall}
            >
              {isExecutingCall && <UOLoader size={14} />}
              {emailTemplate ? 'Update' : 'Create'}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateUpdateEmailTemplate;
