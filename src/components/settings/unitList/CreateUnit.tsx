import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';
import * as Yup from 'yup';

import FormikAutocomplete from 'components/common/FormikAutocomplete';
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

  const initialValues: Unit = unit
    ? unit
    : {
        id: '',
        unit: '',
        quantity: '',
        symbol: '',
        siConversionFormula: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (newUnit): Promise<void> => {
        const data = await api('Unit created successfully').createUnit(newUnit);
        if (data.createUnit.rejection) {
          close(null);
        } else if (data.createUnit.unit) {
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
            margin="normal"
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
            margin="normal"
            fullWidth
            InputProps={{ 'data-cy': 'unit-name' }}
            disabled={isExecutingCall}
            required
          />
          <FormikAutocomplete
            name="quantity"
            label="Quantity"
            items={quantities.map((unit) => ({
              text: `${unit.id}`,
              value: unit.id,
            }))}
            InputProps={{ 'data-cy': 'unit-quantity' }}
            required
            loading={loadingQuantities}
          />
          <Field
            name="symbol"
            label="Symbol"
            type="text"
            component={TextField}
            margin="normal"
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
            margin="normal"
            fullWidth
            InputProps={{ 'data-cy': 'unit-siConversionFormula' }}
            disabled={isExecutingCall}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
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
