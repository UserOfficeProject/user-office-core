import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { Institution } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type CreateUpdateInstitutionProps = {
  close: (institution: Institution | null) => void;
  institution: Institution | null;
};

const CreateUpdateInstitution: React.FC<CreateUpdateInstitutionProps> = ({
  close,
  institution,
}) => {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const initialValues = institution
    ? {
        name: institution.name,
        verified: institution.verified ? 'true' : 'false',
      }
    : {
        name: '',
        verified: 'false',
      };

  const createInstitution = (verified: string, name: string) => {
    api()
      .createInstitution({
        name: name,
        verified: verified === 'true',
      })
      .then(response => {
        const { error, institution } = response.createInstitution;
        if (error) {
          enqueueSnackbar(getTranslation(error as ResourceId), {
            variant: 'error',
          });
          close(null);
        } else if (institution) {
          close(institution);
        }
        setSubmitting(false);
      });
  };

  const updateInstitution = (id: number, verified: string, name: string) => {
    api()
      .updateInstitution({
        id: id,
        name: name,
        verified: verified === 'true',
      })
      .then(response => {
        const { error, institution } = response.updateInstitution;

        if (error) {
          enqueueSnackbar('Failed to update', {
            variant: 'error',
          });
          close(null);
        } else if (institution) {
          close(institution);
        }

        setSubmitting(false);
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        setSubmitting(true);
        institution
          ? updateInstitution(institution.id, values.verified, values.name)
          : createInstitution(values.verified, values.name);
      }}
      validationSchema={{
        name: Yup.string().required(),
        verified: Yup.string().required(),
      }}
    >
      {() => (
        <Form>
          <Typography variant="h6">
            {institution ? 'Update' : 'Create new'} institution
          </Typography>

          <Field
            name="name"
            label="Name"
            type="text"
            component={TextField}
            data-cy="name"
            fullWidth
            disabled={submitting}
          />

          <FormikDropdown
            name="verified"
            label="Verified"
            items={[
              { text: 'true', value: 'true' },
              { text: 'false', value: 'false' },
            ]}
            data-cy="verified"
            disabled={submitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            data-cy="submit"
            disabled={submitting}
          >
            {submitting && <UOLoader size={14} />}
            {institution ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateInstitution;
