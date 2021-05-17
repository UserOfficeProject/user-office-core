import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
} from '@esss-swap/duo-validation/lib/Instrument';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Instrument } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUpdateInstrumentProps = {
  close: (instrumentAdded: Instrument | null) => void;
  instrument: Instrument | null;
};

const CreateUpdateInstrument: React.FC<CreateUpdateInstrumentProps> = ({
  close,
  instrument,
}) => {
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = instrument
    ? instrument
    : {
        name: '',
        shortCode: '',
        description: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (instrument) {
          const data = await api(
            'Instrument updated successfully!'
          ).updateInstrument({
            id: instrument.id,
            ...values,
          });
          if (data.updateInstrument.rejection) {
            close(null);
          } else if (data.updateInstrument.instrument) {
            close(data.updateInstrument.instrument);
          }
        } else {
          const data = await api(
            'Instrument created successfully!'
          ).createInstrument(values);
          if (data.createInstrument.rejection) {
            close(null);
          } else if (data.createInstrument.instrument) {
            close(data.createInstrument.instrument);
          }
        }
      }}
      validationSchema={
        instrument
          ? updateInstrumentValidationSchema
          : createInstrumentValidationSchema
      }
    >
      {() => (
        <Form>
          <Typography variant="h6">
            {instrument ? 'Update' : 'Create new'} instrument
          </Typography>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="name"
            disabled={isExecutingCall}
          />
          <Field
            name="shortCode"
            id="shortCode"
            label="Short code"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="shortCode"
            disabled={isExecutingCall}
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
            data-cy="description"
            disabled={isExecutingCall}
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
            {instrument ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUpdateInstrument.propTypes = {
  instrument: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    shortCode: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    scientists: PropTypes.array.isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default CreateUpdateInstrument;
