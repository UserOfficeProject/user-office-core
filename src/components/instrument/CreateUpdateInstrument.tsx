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

import FormikDropdown from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { Instrument, UserRole } from 'generated/sdk';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

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
  const { usersData } = useUsersData({
    userRole: UserRole.INSTRUMENT_SCIENTIST,
  });

  if (!usersData) {
    return <UOLoader />;
  }
  const initialValues = instrument
    ? instrument
    : {
        name: '',
        shortCode: '',
        description: '',
        managerUserId: -1,
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

          <FormikDropdown
            name="managerUserId"
            label="Beamline manager"
            noOptionsText="No one"
            items={usersData.users.map((user) => ({
              text: getFullUserName(user),
              value: user.id,
            }))}
            InputProps={{
              'data-cy': 'beamline-manager',
            }}
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
    managerUserId: PropTypes.number.isRequired,
    scientists: PropTypes.array.isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default CreateUpdateInstrument;
