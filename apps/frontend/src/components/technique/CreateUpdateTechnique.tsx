import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  createTechniqueValidationSchema,
  updateTechniqueValidationSchema,
} from '@user-office-software/duo-validation/lib/Technique';
import { Field, Form, Formik } from 'formik';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { TechniqueFragment } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdateTechniqueProps = {
  close: (techniqueAdded: TechniqueFragment | null) => void;
  technique: TechniqueFragment | null;
};

const CreateUpdateTechnique = ({
  close,
  technique,
}: CreateUpdateTechniqueProps) => {
  const { t } = useTranslation();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = {
    name: '',
    shortCode: '',
    description: '',
    ...technique,
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (technique) {
          try {
            const { updateTechnique } = await api({
              toastSuccessMessage: t('Technique') + ' updated successfully!',
            }).updateTechnique({
              ...values,
              techniqueId: technique.id,
            });

            close(updateTechnique);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createTechnique } = await api({
              toastSuccessMessage: t('Technique') + ' created successfully!',
            }).createTechnique(values);

            close(createTechnique);
          } catch (error) {
            close(null);
          }
        }
      }}
      validationSchema={
        !!technique
          ? updateTechniqueValidationSchema
          : createTechniqueValidationSchema
      }
    >
      {({ isValid }) => (
        <Form>
          <Typography variant="h6" component="h1">
            {(technique ? 'Update ' : 'Create new ') +
              i18n.format(t('Technique'), 'lowercase')}
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
            name="shortCode"
            id="shortCode"
            label="Short code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="shortCode"
            disabled={isExecutingCall}
            required
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
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
            {technique ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateTechnique;
