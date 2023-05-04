import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { InstrumentFragment } from 'generated/sdk';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  form: {
    width: '240px',
  },
}));

type AssignProposalsToInstrumentProps = {
  close: () => void;
  assignProposalsToInstrument: (
    instrument: InstrumentFragment | null
  ) => Promise<void>;
  callIds: number[];
  instrumentIds: (number | null)[];
};

const AssignProposalsToInstrument: React.FC<
  AssignProposalsToInstrumentProps
> = ({ close, assignProposalsToInstrument, callIds, instrumentIds }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { instruments, loadingInstruments } = useInstrumentsData(callIds);

  const allSelectedProposalsHaveSameInstrument = instrumentIds.every(
    (item) => item === instrumentIds[0]
  );

  const selectedProposalsInstrument =
    allSelectedProposalsHaveSameInstrument && instrumentIds[0]
      ? instrumentIds[0]
      : null;

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-instrument-assignment"
    >
      <Formik
        initialValues={{
          selectedInstrumentId: selectedProposalsInstrument,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedInstrument = instruments.find(
            (instrument) => instrument.id === values.selectedInstrumentId
          );

          await assignProposalsToInstrument(selectedInstrument || null);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form className={classes.form}>
            <Typography
              className={classes.cardHeader}
              variant="h6"
              component="h1"
            >
              {`Assign proposal/s to ${i18n.format(
                t('instrument'),
                'lowercase'
              )}`}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikUIAutocomplete
                  name="selectedInstrumentId"
                  label="Select instrument"
                  loading={loadingInstruments}
                  items={instruments.map((instrument) => ({
                    value: instrument.id,
                    text: instrument.name,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText={
                    'No ' +
                    i18n.format(
                      i18n.format(t('instrument'), 'plural'),
                      'lowercase'
                    )
                  }
                  data-cy="instrument-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedInstrumentId && (
              <Alert severity="warning" data-cy="remove-instrument-alert">
                {`Be aware that leaving ${i18n.format(
                  t('instrument'),
                  'lowercase'
                )} selection empty will remove
                assigned instrument from proposal/s.`}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              className={classes.submit}
              disabled={isSubmitting || loadingInstruments}
              data-cy="submit-assign-remove-instrument"
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

// NOTE: This comparison is done to prevent component re-rendering on modal close
export default React.memo(
  AssignProposalsToInstrument,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.callIds) === JSON.stringify(nextProps.callIds)
);
