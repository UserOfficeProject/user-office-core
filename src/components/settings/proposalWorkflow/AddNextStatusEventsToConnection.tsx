import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import FormikUICustomMultipleSelect from 'components/common/FormikUICustomMultipleSelect';

const addNextStatusEventsToConnectionValidationSchema = yup.object().shape({
  selectedNextStatusEvents: yup
    .array()
    .of(yup.string())
    .required('You must select parent droppable group id'),
});

const useStyles = makeStyles(theme => ({
  formControl: {
    width: '100%',
  },
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddNextStatusEventsToConnectionProps = {
  nextStatusEvents: string[];
  close: () => void;
  addNextStatusEventsToConnection: (nextStatusEvents: string[]) => void;
};

const AddNextStatusEventsToConnection: React.FC<AddNextStatusEventsToConnectionProps> = ({
  nextStatusEvents,
  close,
  addNextStatusEventsToConnection,
}) => {
  const classes = useStyles();

  const initialValues: {
    selectedNextStatusEvents: string[];
  } = {
    selectedNextStatusEvents: nextStatusEvents,
  };

  const events = [
    'PROPOSAL_SUBMITTED',
    'PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED',
    'PROPOSAL_SAMPLE_REVIEW_SUBMITTED',
    'PROPOSAL_SEP_SELECTED',
    'PROPOSAL_INSTRUMENT_SELECTED',
    'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
    'PROPOSAL_SEP_REVIEW_SUBMITTED',
    'PROPOSAL_SEP_MEETING_SUBMITTED',
    'PROPOSAL_INSTRUMENT_SUBMITTED',
    'PROPOSAL_FINAL_DECISION_SUBMITTED',
    'PROPOSAL_REJECTED',
  ];

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, actions): Promise<void> => {
          actions.setSubmitting(false);

          addNextStatusEventsToConnection(values.selectedNextStatusEvents);
          close();
        }}
        validationSchema={addNextStatusEventsToConnectionValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Events that are triggering next status
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field
                  name="selectedNextStatusEvents"
                  id="selectedNextStatusEvents"
                  component={FormikUICustomMultipleSelect}
                  availableOptions={events}
                  margin="dense"
                  width="auto"
                  fullWidth
                  required
                  data-cy="next-status-events"
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
              Add status events
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddNextStatusEventsToConnection.propTypes = {
  nextStatusEvents: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
  addNextStatusEventsToConnection: PropTypes.func.isRequired,
};

export default AddNextStatusEventsToConnection;
