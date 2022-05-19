import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { Unit } from 'generated/sdk';
import { useQuantities } from 'hooks/admin/useQuantities';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUnitProps = {
  close: (unitAdded: Unit | null) => void;
  unit: Unit | null;
};

const CreateUnit: React.FC<CreateUnitProps> = ({ close, unit }) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { quantities, loadingQuantities } = useQuantities();

  const initialValues = unit
    ? unit
    : {
        id: '',
        unit: '',
        quantity: null,
        symbol: '',
        siConversionFormula: '',
      };

  if (loadingQuantities) return <UOLoader />;

  const quantityOptions = quantities.map((quantity) => ({
    text: quantity.id,
    value: quantity.id,
  }));

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (newUnit): Promise<void> => {
        const data = await api({
          toastSuccessMessage: 'Unit created successfully',
        }).createUnit(newUnit as Unit);
        if (data.createUnit.unit) {
          close(data.createUnit.unit);
        }
      }}
      validationSchema={Yup.object().shape({
        id: Yup.string().required('Id is required'),
        unit: Yup.string().required('Name is required'),
        quantity: Yup.string().required('Quantity is required'),
        symbol: Yup.string().required('Symbol is required'),
        siConversionFormula: Yup.string().required(
          'Conversion formula is required'
        ),
      })}
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            Create new units
          </Typography>

          <Field
            name="id"
            label="ID"
            type="text"
            component={TextField}
            fullWidth
            InputProps={{ 'data-cy': 'unit-id' }}
            disabled={isExecutingCall}
            required
          />

          <Field
            name="unit"
            label="Name"
            type="text"
            component={TextField}
            fullWidth
            InputProps={{ 'data-cy': 'unit-name' }}
            disabled={isExecutingCall}
            required
          />
          <FormikUIAutocomplete
            name="quantity"
            label="Quantity"
            loading={loadingQuantities}
            noOptionsText="No templates"
            items={quantityOptions}
            InputProps={{ 'data-cy': 'unit-quantity' }}
            required
          />
          <Field
            name="symbol"
            label="Symbol"
            type="text"
            component={TextField}
            fullWidth
            InputProps={{ 'data-cy': 'unit-symbol' }}
            disabled={isExecutingCall}
            required
          />
          <Field
            name="siConversionFormula"
            label="SI conversion formula"
            type="text"
            component={TextField}
            fullWidth
            InputProps={{ 'data-cy': 'unit-siConversionFormula' }}
            disabled={isExecutingCall}
            required
          />
          <Button
            type="submit"
            fullWidth
            className={classes.submit}
            data-cy="submit"
            disabled={isExecutingCall}
          >
            {isExecutingCall && <UOLoader size={14} />}
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUnit.propTypes = {
  unit: PropTypes.any,
  close: PropTypes.func.isRequired,
};

export default CreateUnit;
