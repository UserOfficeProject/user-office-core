import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
} from '@user-office-software/duo-validation/lib/Instrument';
import { Field, Form, Formik, FormikProps } from 'formik';
import { TextField } from 'formik-mui';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  BasicUserDetailsFragment,
  FeatureId,
  InstrumentFragment,
  UserRole,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserNameWithEmail } from 'utils/user';

type CreateUpdateInstrumentProps = {
  close: (instrumentAdded: InstrumentFragment | null) => void;
  instrument: InstrumentFragment | null;
};

const CreateUpdateInstrument = ({
  close,
  instrument,
}: CreateUpdateInstrumentProps) => {
  const featureContext = useContext(FeatureContext);
  const isUserSurnameSearchEnabled = featureContext.featuresMap.get(
    FeatureId.USER_SEARCH_FILTER
  )?.isEnabled;
  const { t } = useTranslation();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [usersData, setUsersData] = useState(
    instrument?.instrumentContact ? [instrument?.instrumentContact] : []
  );

  const initialValues = instrument
    ? { ...instrument, surname: '' }
    : {
        name: '',
        shortCode: '',
        description: '',
        managerUserId: null,
        surname: '',
      };

  useEffect(() => {
    if (!isUserSurnameSearchEnabled) {
      api()
        .getUsers({ userRole: UserRole.INSTRUMENT_SCIENTIST })
        .then((data) => {
          setUsersData(data.users?.users || []);
        });
    }
  }, [isUserSurnameSearchEnabled, api]);

  const findUserBySurname = async (
    value: string,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    if (!value) {
      return;
    }

    try {
      await api()
        .getUsers({ filter: value })
        .then((data) => {
          if (data.users?.totalCount == 0) {
            setFieldError('surname', 'No users found with that surname');
          } else {
            setUsersData(data.users?.users || []);
          }
        });
    } catch (error) {
      close(null);
    }
  };

  const SurnameSearchField = (
    formikProps: FormikProps<typeof initialValues>
  ) => {
    const { values, setFieldError } = formikProps;

    return isUserSurnameSearchEnabled ? (
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Field
          id="surname"
          name="surname"
          label="Surname"
          type="text"
          component={TextField}
          fullWidth
          flex="1"
          data-cy="instrument-contact-surname"
        />
        <Button
          data-cy="findUser"
          type="button"
          disabled={!values.surname}
          onClick={() => findUserBySurname(values.surname, setFieldError)}
          sx={{ minWidth: 'fit-content' }}
        >
          Find User
        </Button>
      </Stack>
    ) : null;
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
      {(formikProps) => (
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
          <SurnameSearchField {...formikProps} />
          <FormikUIAutocomplete
            name="managerUserId"
            label="Instrument Contact"
            noOptionsText="No one"
            items={usersData
              .sort(
                (a: BasicUserDetailsFragment, b: BasicUserDetailsFragment) =>
                  a.firstname > b.firstname ? 1 : -1
              )
              .map((user) => ({
                text: getFullUserNameWithEmail(user),
                value: user.id,
              }))}
            InputProps={{
              'data-cy': 'instrument-contact',
            }}
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
