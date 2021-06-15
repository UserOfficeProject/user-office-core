import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import FormikDropdown from 'components/common/FormikDropdown';
import { Instrument } from 'generated/sdk';
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
  assignProposalsToInstrument: (instrument: Instrument | null) => Promise<void>;
  callIds: number[];
  instrumentIds: (number | null)[];
};

const AssignProposalsToInstrument: React.FC<AssignProposalsToInstrumentProps> = ({
  close,
  assignProposalsToInstrument,
  callIds,
  instrumentIds,
}) => {
  const classes = useStyles();
  const { instruments, loadingInstruments } = useInstrumentsData(callIds);
  const [firstInstrumentId] = instrumentIds;

  return (
    <Container
      component="main"
      maxWidth="xs"
      data-cy="proposals-instrument-assignment"
    >
      <Formik
        initialValues={{
          selectedInstrumentId: firstInstrumentId || 0,
        }}
        onSubmit={async (values): Promise<void> => {
          const selectedInstrument = instruments.find(
            (instrument) => instrument.id === +values.selectedInstrumentId
          );

          await assignProposalsToInstrument(selectedInstrument || null);
          close();
        }}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form className={classes.form}>
            <Typography className={classes.cardHeader}>
              Assign proposal/s to instrument
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedInstrumentId"
                  label="Select instrument"
                  loading={loadingInstruments}
                  items={instruments.map((instrument) => ({
                    value: instrument.id.toString(),
                    text: instrument.name,
                  }))}
                  disabled={isSubmitting}
                  noOptionsText="No instruments"
                  isClearable
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
              variant="contained"
              color="primary"
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
