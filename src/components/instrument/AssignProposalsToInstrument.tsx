import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

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
  const { instruments, loadingInstruments } = useInstrumentsData(callIds);

  const allSelectedProposalsHaveSameInstrument = instrumentIds.every(
    (item) => item === instrumentIds[0]
  );

  const selectedProposalsInstrument =
    allSelectedProposalsHaveSameInstrument && instrumentIds[0]
      ? instrumentIds[0]
      : undefined;

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
              Assign proposal/s to instrument
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
                  noOptionsText="No instruments"
                  data-cy="instrument-selection"
                />
              </Grid>
            </Grid>
            {!values.selectedInstrumentId && (
              <Alert severity="warning" data-cy="remove-instrument-alert">
                Be aware that leaving instrument selection empty will remove
                assigned instrument from proposal/s.
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

AssignProposalsToInstrument.propTypes = {
  close: PropTypes.func.isRequired,
  assignProposalsToInstrument: PropTypes.func.isRequired,
  callIds: PropTypes.array.isRequired,
  instrumentIds: PropTypes.array.isRequired,
};

export default AssignProposalsToInstrument;
