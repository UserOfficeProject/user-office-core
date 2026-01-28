import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { getCurrentUser } from 'context/UserContextProvider';
import { EmailTemplateFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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

  const initialValues = {
    id: emailTemplate?.id || 0,
    name: emailTemplate?.name || '',
    description: emailTemplate?.description || '',
    subject: emailTemplate?.subject || '',
    body: emailTemplate?.body || '',
    createdByUserId:
      emailTemplate?.createdByUserId ||
      (getCurrentUser()?.user.id as number) ||
      0,
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (emailTemplate) {
          try {
            const { updateEmailTemplate } = await api({
              toastSuccessMessage: 'Email template updated successfully!',
            }).updateEmailTemplate(values);

            close(updateEmailTemplate);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createEmailTemplate } = await api({
              toastSuccessMessage: 'Email template created successfully!',
            }).createEmailTemplate(values);

            close(createEmailTemplate);
          } catch (error) {
            close(null);
          }
        }
      }}
    >
      {({ isValid }) => (
        <Form>
          <Typography variant="h6" component="h1">
            {(emailTemplate ? 'Update ' : 'Create new ') +
              i18n.format(t('Email template'), 'lowercase')}
          </Typography>
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
            fullWidth
            data-cy="description"
            disabled={isExecutingCall}
            required
          />
          <Field
            name="subject"
            id="subject"
            label="Subject"
            type="text"
            component={TextField}
            fullWidth
            data-cy="subject"
            disabled={isExecutingCall}
            required
          />
          <Field
            id="body"
            name="body"
            label="Body"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="body"
            disabled={isExecutingCall}
            required
          />
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
      )}
    </Formik>
  );
};

export default CreateUpdateEmailTemplate;
