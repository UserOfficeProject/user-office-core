import { LocalizationProvider } from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterLuxon';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { DateTimePicker } from 'formik-mui-lab';
import i18n from 'i18n';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { ReviewMeetingFragment, UserRole } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useUsersData } from 'hooks/user/useUsersData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUpdateReviewMeetingProps = {
  close: (reviewMeetingAdded: ReviewMeetingFragment | null) => void;
  reviewMeeting: ReviewMeetingFragment | null;
};

const CreateUpdateReviewMeeting = ({
  close,
  reviewMeeting,
}: CreateUpdateReviewMeetingProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { user } = useContext(UserContext);

  const { usersData } = useUsersData({
    userRole: UserRole.INSTRUMENT_SCIENTIST,
  });
  const { instruments } = useInstrumentsData();
  const { format: dateTimeFormat, mask, timezone } = useFormattedDateTime();
  const theme = useTheme();

  if (!usersData) {
    return <UOLoader />;
  }

  const currentDateTime = DateTime.now().setZone(timezone || undefined);

  const initialValues = reviewMeeting
    ? reviewMeeting
    : {
        name: '',
        details: '',
        occursAt: currentDateTime,
        instrumentId: null,
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        if (values.instrumentId === null) {
          return;
        }

        if (reviewMeeting) {
          try {
            const { updateReviewMeeting } = await api({
              toastSuccessMessage:
                t('Call review meeting') + ' updated successfully!',
            }).updateReviewMeeting({
              ...values,
              reviewMeetingId: reviewMeeting.id,
            });
            close(updateReviewMeeting);
          } catch (error) {
            console.error(error);
            close(null);
          }
        } else {
          try {
            const { createReviewMeeting } = await api({
              toastSuccessMessage:
                t('Call review meeting') + ' created successfully!',
            }).createReviewMeeting({ ...values, creatorId: user.id });

            close(createReviewMeeting);
          } catch (error) {
            console.error(error);
            close(null);
          }
        }
      }}
      // TODO: Add validation schema?
      // validationSchema={
      //   instrument
      //     ? updateInstrumentValidationSchema
      //     : createInstrumentValidationSchema
      // }
    >
      {() => (
        <Form>
          <Typography variant="h6" component="h1">
            {(reviewMeeting ? 'Update ' : 'Create new ') +
              i18n.format(t('call review meeting'), 'lowercase')}
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
            name="details"
            id="details"
            label="Details"
            type="text"
            component={TextField}
            fullWidth
            multiline
            maxRows="16"
            minRows="3"
            data-cy="details"
            disabled={isExecutingCall}
            required
          />
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Field
              name="occursAt"
              label={`End (${timezone})`}
              id="occurs-at-input"
              inputFormat={dateTimeFormat}
              mask={mask}
              ampm={false}
              allowSameDateSelection
              component={DateTimePicker}
              inputProps={{ placeholder: dateTimeFormat }}
              textField={{
                fullWidth: true,
                required: true,
                'data-cy': 'occurs-at-date',
              }}
              // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions
              // https://stackoverflow.com/a/69986695/5619063 and https://github.com/cypress-io/cypress/issues/970
              desktopModeMediaQuery={theme.breakpoints.up('sm')}
              required
            />
          </LocalizationProvider>

          <FormikUIAutocomplete
            name="instrumentId"
            label="Instrument"
            noOptionsText="No one"
            items={instruments.map((user) => ({
              text: user.name,
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
            {reviewMeeting ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUpdateReviewMeeting.propTypes = {
  reviewMeeting: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    occursAt: PropTypes.string.isRequired,
    instrumentId: PropTypes.number.isRequired,
  }),
  close: PropTypes.func.isRequired,
};

export default CreateUpdateReviewMeeting;
