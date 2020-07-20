import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import { Institution } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type CreateInstitutionProps = {
  onComplete?: (institution: Institution | null) => void;
};
const CreateInstitution = (props: CreateInstitutionProps) => {
  const { onComplete } = props;
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik
      initialValues={{ name: '', verified: 'false' }}
      onSubmit={async (values): Promise<void> =>
        await api()
          .createInstitution({
            name: values.name,
            verified: values.verified === 'true',
          })
          .then(response => {
            const { error, institution } = response.createInstitution;
            if (error) {
              enqueueSnackbar(getTranslation(error as ResourceId), {
                variant: 'error',
              });
            }
            onComplete?.(institution);
          })
      }
      validationSchema={{
        name: Yup.string().required(),
        verified: Yup.bool().required(),
      }}
    >
      {() => (
        <Form>
          <Typography variant="h6">Create new institution</Typography>

          <Field
            name="name"
            label="Name"
            type="text"
            component={TextField}
            data-cy="name"
            fullWidth
          />

          <FormikDropdown
            name="verified"
            label="Verified"
            items={[
              { text: 'true', value: 'true' },
              { text: 'false', value: 'false' },
            ]}
            data-cy="verified"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            data-cy="submit"
          >
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateInstitution;
