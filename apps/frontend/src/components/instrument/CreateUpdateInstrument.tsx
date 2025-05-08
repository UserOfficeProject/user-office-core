import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
} from '@user-office-software/duo-validation/lib/Instrument';
import { Field, Form, Formik, FormikProps } from 'formik';
import i18n from 'i18n';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  BasicUserDetailsFragment,
  FeatureId,
  InstrumentFragment,
  UserRole,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName, getFullUserNameWithEmail } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type CreateUpdateInstrumentProps = {
  close: (instrumentAdded: InstrumentFragment | null) => void;
  instrument: InstrumentFragment | null;
  confirm: WithConfirmType;
};

const CreateUpdateInstrument = ({
  close,
  instrument,
  confirm,
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
  const [isReviewerUpdateChecked, setIsReviewerUpdateChecked] = useState(false);

  console.log(instrument);

  const initialValues = instrument
    ? { ...instrument, surname: '' }
    : {
        name: '',
        shortCode: '',
        description: '',
        managerUserId: null,
        surname: '',
        selectable: true,
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
        .getUsers({ filter: value, userRole: UserRole.INSTRUMENT_SCIENTIST })
        .then((data) => {
          if (data.users?.totalCount == 0) {
            setFieldError(
              'surname',
              'No ' +
                i18n.format(t('instrumentSci'), 'plural') +
                ' found with that surname'
            );
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

  const handleConfirmSubmit = async (values: typeof initialValues) => {
    if (instrument) {
      const updatedValues = { ...values };

      if (updatedValues.managerUserId === null) {
        return;
      }

      if (
        values.managerUserId !== instrument.managerUserId &&
        isReviewerUpdateChecked
      ) {
        confirm(
          async () => {
            try {
              const isManagerUpdated =
                values.managerUserId &&
                values.managerUserId !== instrument.managerUserId;
              const newManager = usersData.find(
                (user) => user.id === values.managerUserId
              );
              const newManagerName = newManager
                ? getFullUserName(newManager)
                : '';

              const { updateInstrument } = await api({
                toastSuccessMessage:
                  t('instrument') +
                  ' updated successfully! ' +
                  (isManagerUpdated
                    ? t('Instrument Contact') + ` updated to ${newManagerName}`
                    : ''),
              }).updateInstrument({
                id: updatedValues.id,
                name: updatedValues.name,
                shortCode: updatedValues.shortCode,
                description: updatedValues.description,
                managerUserId: updatedValues.managerUserId,
                updateTechReview: true,
                selectable: updatedValues.selectable,
              });

              close(updateInstrument);
            } catch (error) {
              close(null);
            }
          },
          {
            title: 'Confirm Technical Reviewer Reassignment',
            description:
              'Are you sure you want to update the technical reviewer assignment? This action will change the technical reviewer.',
          }
        )();
      } else {
        try {
          const { updateInstrument } = await api({
            toastSuccessMessage: t('instrument') + ' updated successfully!',
          }).updateInstrument({
            id: instrument.id,
            name: updatedValues.name,
            shortCode: updatedValues.shortCode,
            description: updatedValues.description,
            managerUserId: updatedValues.managerUserId,
            updateTechReview: false,
            selectable: updatedValues.selectable,
          });

          close(updateInstrument);
        } catch (error) {
          close(null);
        }
      }
    } else {
      if (values.managerUserId === null) {
        return;
      }

      try {
        const { createInstrument } = await api({
          toastSuccessMessage: t('instrument') + ' created successfully!',
        }).createInstrument(values);

        close(createInstrument);
      } catch (error) {
        close(null);
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => handleConfirmSubmit(values)}
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
            component={TextField}
            type="text"
            data-cy="firstname"
            disabled={isExecutingCall}
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
            required
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            multiline
            maxRows="16"
            minRows="3"
            data-cy="description"
            disabled={isExecutingCall}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                checked={formikProps.values.selectable}
              />
            }
            label="Allow this instrument to be selectable in proposal submission"
          />
          <SurnameSearchField {...formikProps} />
          <FormikUIAutocomplete
            name="managerUserId"
            label={t('Instrument Contact')}
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
            data-cy="instrument-contact"
            required
          />

          {instrument &&
            formikProps.values.managerUserId !== instrument.managerUserId && (
              <FormControlLabel
                control={
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    checked={isReviewerUpdateChecked}
                    onChange={(event) =>
                      setIsReviewerUpdateChecked(event.target.checked)
                    }
                  />
                }
                label="Update all un-assigned technical reviews to new contact"
              />
            )}

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

export default withConfirm(CreateUpdateInstrument);
