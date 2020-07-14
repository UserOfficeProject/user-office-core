import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import { Instrument } from 'generated/sdk';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

const assignProposalToInstrumentValidationSchema = yup.object().shape({
  selectedInstrumentId: yup.string().required('You must select instrument'),
});

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AssignProposalsToInstrumentProps = {
  close: () => void;
  assignProposalsToInstrument: (instrument: Instrument) => void;
};

const AssignProposalsToInstrument: React.FC<AssignProposalsToInstrumentProps> = ({
  close,
  assignProposalsToInstrument,
}) => {
  const classes = useStyles();
  const { instrumentsData } = useInstrumentsData();

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedInstrumentId: '',
        }}
        onSubmit={async (values, actions): Promise<void> => {
          actions.setSubmitting(false);

          const selectedInstrument = instrumentsData.find(
            instrument =>
              instrument.instrumentId === +values.selectedInstrumentId
          );

          assignProposalsToInstrument(selectedInstrument as Instrument);
          close();
        }}
        validationSchema={assignProposalToInstrumentValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Assign proposal/s to instrument
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedInstrumentId"
                  label="Select instrument"
                  items={instrumentsData.map(instrument => ({
                    value: instrument.instrumentId.toString(),
                    text: instrument.name,
                  }))}
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isSubmitting}
              data-cy="submit"
            >
              Assign to Instrument
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
};

export default AssignProposalsToInstrument;
