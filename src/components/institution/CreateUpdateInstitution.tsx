import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

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
        verified: institution.verified,
      }
    : {
        name: '',
        verified: false,
      };

  const createInstitution = (verified: boolean, name: string) => {
    api('Institution created successfully!')
      .createInstitution({
        name,
        verified,
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

  const updateInstitution = (id: number, verified: boolean, name: string) => {
    api('Institution updated successfully!')
      .updateInstitution({
        id,
        name,
        verified,
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
      validationSchema={Yup.object().shape({
        name: Yup.string().required(),
        verified: Yup.boolean().required(),
      })}
    >
      {({ values, setFieldValue }) => (
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
          <FormControlLabel
            style={{ marginTop: '10px' }}
            control={
              <Field
                id="verified"
                name="verified"
                type="checkbox"
                component={Checkbox}
                value={values.verified}
                color="primary"
                onChange={(): void =>
                  setFieldValue('verified', !values.verified)
                }
                inputProps={{
                  'aria-label': 'primary checkbox',
                  'data-cy': 'institution-verified',
                }}
                disabled={isExecutingCall}
              />
            }
            label="Verified"
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

CreateUpdateInstitution.propTypes = {
  institution: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    verified: PropTypes.bool.isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default CreateUpdateInstitution;
