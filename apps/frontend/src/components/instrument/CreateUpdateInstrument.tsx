import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
} from '@user-office-software/duo-validation/lib/Instrument';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import {
  BasicUserDetailsFragment,
  InstrumentFragment,
  UserRole,
} from 'generated/sdk';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserNameWithEmail } from 'utils/user';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUpdateInstrumentProps = {
  close: (instrumentAdded: InstrumentFragment | null) => void;
  instrument: InstrumentFragment | null;
};

const CreateUpdateInstrument = ({
  close,
  instrument,
}: CreateUpdateInstrumentProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
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
        managerUserId: null,
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (values.managerUserId === null) {
          return;
        }

        if (instrument) {
          try {
            const { updateInstrument } = await api({
              toastSuccessMessage: t('instrument') + ' updated successfully!',
            }).updateInstrument({
              ...values,
              id: instrument.id,
            });

            close(updateInstrument);
          } catch (error) {
            close(null);
          }
        } else {
          try {
            const { createInstrument } = await api({
              toastSuccessMessage: t('instrument') + ' created successfully!',
            }).createInstrument(values);

            close(createInstrument);
          } catch (error) {
            close(null);
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
          <Typography variant="h6" component="h1">
            {(instrument ? 'Update ' : 'Create new ') +
              i18n.format(t('instrument'), 'lowercase')}
          </Typography>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            fullWidth
            data-cy="name"
            disabled={isExecutingCall}
            required
          />
          <Field
            name="shortCode"
            id="shortCode"
            label="Short code"
            type="text"
            component={TextField}
            fullWidth
            data-cy="shortCode"
            disabled={isExecutingCall}
            required
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            disabled={isExecutingCall}
            required
          />

          <FormikUIAutocomplete
            name="managerUserId"
            label="Beamline manager"
            noOptionsText="No one"
            items={usersData.users
              .sort(
                (a: BasicUserDetailsFragment, b: BasicUserDetailsFragment) =>
                  a.firstname > b.firstname ? 1 : -1
              )
              .map((user) => ({
                text: getFullUserNameWithEmail(user),
                value: user.id,
              }))}
            InputProps={{
              'data-cy': 'beamline-manager',
            }}
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
