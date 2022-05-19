import { Check, MergeType } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { Institution } from 'generated/sdk';
import { useGetFields } from 'hooks/user/useGetFields';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';

type CreateUpdateInstitutionProps = {
  close: (institution: Institution | null) => void;
  institution: Institution | null;
};

const CreateUpdateInstitution: React.FC<CreateUpdateInstitutionProps> = ({
  close,
  institution,
}) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const history = useHistory();
  const fieldsContent = useGetFields();
  const [countriesList, setCountriesList] = useState<Option[]>([]);
  const initialValues = institution
    ? {
        name: institution.name,
        country: institution.country?.id,
        verified: institution.verified,
      }
    : {
        name: '',
        country: 0,
        verified: false,
      };

  if (!fieldsContent) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

  if (!countriesList.length) {
    setCountriesList(
      fieldsContent.countries.map((country) => {
        return { text: country.value, value: country.id };
      })
    );
  }

  const createInstitution = async (
    verified: boolean,
    name: string,
    country: number
  ) => {
    const response = await api({
      toastSuccessMessage: 'Institution created successfully!',
    }).createInstitution({
      name,
      country,
      verified,
    });

    const { rejection, institution } = response.createInstitution;
    if (rejection) {
      close(null);
    } else if (institution) {
      close(institution);
    }
  };

  const updateInstitution = async (
    id: number,
    verified: boolean,
    country: number,
    name: string
  ) => {
    const response = await api({
      toastSuccessMessage: 'Institution updated successfully!',
    }).updateInstitution({
      id,
      name,
      verified,
      country,
    });
    const { rejection: error, institution } = response.updateInstitution;
    if (error) {
      close(null);
    } else if (institution) {
      close(institution);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        institution
          ? await updateInstitution(
              institution.id,
              values.verified,
              values.country as number,
              values.name
            )
          : await createInstitution(
              values.verified,
              values.name,
              values.country as number
            );
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(),
        verified: Yup.boolean().required(),
        country: Yup.number().positive('Country is required').required(),
      })}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <Typography variant="h6" component="h1">
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
            required
          />
          <FormikUIAutocomplete
            name="country"
            label="Country"
            items={countriesList}
            data-cy="country"
            required
          />
          <FormControlLabel
            style={{ marginTop: '10px' }}
            control={
              <Field
                id="verified"
                name="verified"
                type="checkbox"
                component={Checkbox}
                checked={values.verified}
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
              {institution ? 'Update' : 'Create'}
            </Button>
          </ActionButtonContainer>
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
    country: PropTypes.shape({
      id: PropTypes.number.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default CreateUpdateInstitution;
