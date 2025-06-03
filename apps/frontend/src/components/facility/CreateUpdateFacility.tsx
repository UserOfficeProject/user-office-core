import { Button, Typography } from '@mui/material';
import { Field, Form, Formik, FormikValues } from 'formik';
import React from 'react';
import { number, object, string } from 'yup';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import {
  CreateFacilityMutationVariables,
  UpdateFacilityMutationVariables,
} from 'generated/sdk';
import { FacilityData } from 'hooks/facility/useFacilitiesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type CreateUpdateFacilityProps = {
  close: (Facility: FacilityData | null) => void;
  facility: FacilityData | null;
};

export const CreateUpdateFacility = ({
  facility,
  close,
}: CreateUpdateFacilityProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = facility ?? {
    name: '',
    shortCode: '',
    instruments: [],
    users: [],
  };
  const updateFacilityValidationSchema = object().shape({
    id: number().required(),
    name: string().required('Name is required'),
    shortCode: string().required('Short code is required'),
  });

  const createFacilityValidationSchema = object().shape({
    name: string().required('Name is required'),
    shortCode: string().required('Short code is required'),
  });

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: FormikValues): Promise<void> => {
          if (facility) {
            const result = await api({
              toastSuccessMessage: 'Facility updated successfully!',
            }).updateFacility(values as UpdateFacilityMutationVariables);
            close({
              ...result.updateFacility,
              instruments: facility.instruments,
            } as FacilityData);
          } else {
            const result = await api({
              toastSuccessMessage: 'Facility created successfully!',
            }).createFacility(values as CreateFacilityMutationVariables);
            close({
              ...result.createFacility,
              instruments: [],
              calls: [],
            } as FacilityData);
          }
        }}
        validationSchema={
          facility
            ? updateFacilityValidationSchema
            : createFacilityValidationSchema
        }
      >
        {() => (
          <Form>
            <Typography variant="h6" component="h1">
              {facility ? 'Update the Facility' : 'Create new Facility'}
            </Typography>
            <Field
              name="name"
              id="name"
              label="Name"
              component={TextField}
              type="text"
              data-cy="facility-name"
              disabled={isExecutingCall}
              fullWidth
              required
            />
            <Field
              name="shortCode"
              id="shortCode"
              label="Short code"
              type="text"
              component={TextField}
              data-cy="shortCode"
              disabled={isExecutingCall}
              fullWidth
              required
            />
            <Button
              type="submit"
              sx={{ marginTop: 2 }}
              fullWidth
              data-cy="submit"
              disabled={isExecutingCall}
            >
              {isExecutingCall && <UOLoader size={14} />}
              {facility ? 'Update' : 'Create'}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};
