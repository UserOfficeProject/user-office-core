import { Check, MergeType } from '@mui/icons-material';
import { TextField, Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { Institution } from 'generated/sdk';
import { useCountries } from 'hooks/user/useCountries';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type UpdateInstitutionProps = {
  close: (institution: Institution | null) => void;
  institution: Institution | null;
};

const UpdateInstitution = ({ close, institution }: UpdateInstitutionProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const history = useHistory();
  const countries = useCountries();
  const initialValues = institution
    ? {
        name: institution.name,
        country: institution.country?.id,
      }
    : {
        name: '',
        country: undefined,
      };

  if (!countries) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

  const updateInstitution = async (
    id: number,
    country: number,
    name: string
  ) => {
    try {
      const { updateInstitution } = await api({
        toastSuccessMessage: 'Institution updated successfully!',
      }).updateInstitution({
        id,
        name,
        country,
      });

      close(updateInstitution);
    } catch (error) {
      close(null);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        institution &&
          values.country &&
          updateInstitution(institution.id, values.country, values.name);
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(),
        country: Yup.number().positive('Country is required').required(),
      })}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            Update institution
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
            required
          />
          <FormikUIAutocomplete
            name="country"
            label="Country"
            items={countries.map((country) => {
              return { text: country.value, value: country.id };
            })}
            data-cy="country"
            required
          />
          <ActionButtonContainer>
            {institution && (
              <Tooltip title="Merge with existing institution">
                <Button
                  startIcon={
                    <MergeType style={{ transform: 'rotate(90deg)' }} />
                  }
                  type="button"
                  data-cy="merge"
                  disabled={isExecutingCall}
                  onClick={() =>
                    history.push(`/MergeInstitutionsPage/${institution.id}`)
                  }
                >
                  {isExecutingCall && <UOLoader size={14} />}
                  Merge
                </Button>
              </Tooltip>
            )}
            <Button
              type="submit"
              data-cy="submit"
              disabled={isExecutingCall}
              startIcon={<Check />}
            >
              {isExecutingCall && <UOLoader size={14} />}
              {institution && 'Update'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
};

UpdateInstitution.propTypes = {
  institution: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    country: PropTypes.shape({
      id: PropTypes.number.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default UpdateInstitution;
