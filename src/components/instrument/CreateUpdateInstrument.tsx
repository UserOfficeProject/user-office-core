import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
} from '@esss-swap/duo-validation';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { Instrument } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddInstrumentProps = {
  close: (instrumentAdded: Instrument | null) => void;
  instrument: Instrument | null;
};

const AddInstrument: React.FC<AddInstrumentProps> = ({ close, instrument }) => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const initialValues = instrument
    ? instrument
    : {
        name: '',
        shortCode: '',
        description: '',
      };

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, actions): Promise<void> => {
          if (!instrument) {
            await api()
              .createInstrument(values)
              .then(data => {
                if (data.createInstrument.error) {
                  enqueueSnackbar(
                    getTranslation(data.createInstrument.error as ResourceId),
                    {
                      variant: 'error',
                    }
                  );
                  close(null);
                } else {
                  close(data.createInstrument.instrument);
                }
              });
          } else {
            await api()
              .updateInstrument({
                instrumentId: instrument.instrumentId,
                ...values,
              })
              .then(data => {
                if (data.updateInstrument.error) {
                  enqueueSnackbar(
                    getTranslation(data.updateInstrument.error as ResourceId),
                    {
                      variant: 'error',
                    }
                  );
                  close(null);
                } else {
                  close(data.updateInstrument.instrument);
                }
              });
          }
          actions.setSubmitting(false);
        }}
        validationSchema={
          instrument
            ? updateInstrumentValidationSchema
            : createInstrumentValidationSchema
        }
      >
        {({ values, errors, handleChange, touched }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Create new instrument
            </Typography>

            <Field
              name="name"
              id="name"
              label="Name"
              type="text"
              value={values.name}
              onChange={handleChange}
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="name"
              error={touched.name && errors.name !== undefined}
              helperText={touched.name && errors.name && errors.name}
            />
            <Field
              name="shortCode"
              id="shortCode"
              label="Short code"
              type="text"
              value={values.shortCode}
              onChange={handleChange}
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="shortCode"
              error={touched.shortCode && errors.shortCode !== undefined}
              helperText={
                touched.shortCode && errors.shortCode && errors.shortCode
              }
            />
            <Field
              id="description"
              name="description"
              label="Description"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              multiline
              rowsMax="16"
              rows="3"
              onChange={handleChange}
              value={values.description}
              data-cy="description"
              error={touched.description && errors.description !== undefined}
              helperText={
                touched.description && errors.description && errors.description
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              data-cy="submit"
            >
              {instrument ? 'Update' : 'Create'} Instrument
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddInstrument.propTypes = {
  instrument: PropTypes.any,
  close: PropTypes.func.isRequired,
};

export default AddInstrument;
