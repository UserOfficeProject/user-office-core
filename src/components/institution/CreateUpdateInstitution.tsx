import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { Institution } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdateInstitutionProps = {
  close: (institution: Institution | null) => void;
  institution: Institution | null;
};

const CreateUpdateInstitution: React.FC<CreateUpdateInstitutionProps> = ({
  close,
  institution,
}) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
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
    api('Institution created successfully!')
      .createInstitution({
        name: name,
        verified: verified === 'true',
      })
      .then(response => {
        const { error, institution } = response.createInstitution;
        if (error) {
          close(null);
        } else if (institution) {
          close(institution);
        }
      });
  };

  const updateInstitution = (id: number, verified: string, name: string) => {
    api('Institution updated successfully!')
      .updateInstitution({
        id: id,
        name: name,
        verified: verified === 'true',
      })
      .then(response => {
        const { error, institution } = response.updateInstitution;

        if (error) {
          close(null);
        } else if (institution) {
          close(institution);
        }
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions): Promise<void> => {
        institution
          ? updateInstitution(institution.id, values.verified, values.name)
          : createInstitution(values.verified, values.name);
        actions.setSubmitting(false);
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
            id="name"
            label="Name"
            type="text"
            component={TextField}
            data-cy="name"
            fullWidth
            disabled={isExecutingCall}
          />

          <FormikDropdown
            name="verified"
            label="Verified"
            items={[
              { text: 'true', value: 'true' },
              { text: 'false', value: 'false' },
            ]}
            data-cy="verified"
            disabled={isExecutingCall}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            data-cy="submit"
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            {institution ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateUpdateInstitution;
