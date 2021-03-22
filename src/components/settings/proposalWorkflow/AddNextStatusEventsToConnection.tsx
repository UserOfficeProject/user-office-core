import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { ErrorMessage, FieldArray, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import UOLoader from 'components/common/UOLoader';
import { Event } from 'generated/sdk';
import { useProposalEventsData } from 'hooks/settings/useProposalEventsData';

const addNextStatusEventsToConnectionValidationSchema = yup.object().shape({
  selectedNextStatusEvents: yup
    .array()
    .of(yup.string())
    .required('You must select at least one event'),
});

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: '100%',
  },
  cardHeader: {
    fontSize: '20px',
    padding: '22px 0 0',
  },
  container: {
    minHeight: '350px',
    marginTop: '10px',
  },
  error: {
    color: theme.palette.error.main,
    marginRight: '10px',
  },
  submitContainer: {
    margin: theme.spacing(2, 0, 2),
  },
  eventDescription: {
    margin: '-5px 0',
    fontSize: 'small',
    color: theme.palette.grey[400],
  },
}));

type AddNextStatusEventsToConnectionProps = {
  close: () => void;
  addNextStatusEventsToConnection: (nextStatusEvents: string[]) => void;
  nextStatusEvents?: Event[];
};

const AddNextStatusEventsToConnection: React.FC<AddNextStatusEventsToConnectionProps> = ({
  nextStatusEvents,
  close,
  addNextStatusEventsToConnection,
}) => {
  const classes = useStyles();

  const { proposalEvents, loadingProposalEvents } = useProposalEventsData();

  const initialValues: {
    selectedNextStatusEvents: Event[];
  } = {
    selectedNextStatusEvents: nextStatusEvents || [],
  };

  return (
    <Container component="main" maxWidth="md">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          addNextStatusEventsToConnection(values.selectedNextStatusEvents);
          close();
        }}
        validationSchema={addNextStatusEventsToConnectionValidationSchema}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Events that are triggering next status
            </Typography>

            <Grid container spacing={1} className={classes.container}>
              {loadingProposalEvents ? (
                <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
              ) : (
                <FieldArray
                  name="selectedNextStatusEvents"
                  render={(arrayHelpers) => (
                    <>
                      {proposalEvents.map((proposalEvent, index) => (
                        <Grid key={index} item sm={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={proposalEvent.name}
                                name="selectedNextStatusEvents"
                                value={proposalEvent.name}
                                checked={values.selectedNextStatusEvents.includes(
                                  proposalEvent.name
                                )}
                                color="primary"
                                data-cy="next-status-event"
                                onChange={(e) => {
                                  if (e.target.checked)
                                    arrayHelpers.push(proposalEvent.name);
                                  else {
                                    const idx = values.selectedNextStatusEvents.indexOf(
                                      proposalEvent.name
                                    );
                                    arrayHelpers.remove(idx);
                                  }
                                }}
                                inputProps={{
                                  'aria-label': 'primary checkbox',
                                }}
                              />
                            }
                            label={proposalEvent.name}
                          />
                          <p className={classes.eventDescription}>
                            {proposalEvent.description}
                          </p>
                        </Grid>
                      ))}
                    </>
                  )}
                />
              )}
            </Grid>
            <Grid
              container
              justify="flex-end"
              className={classes.submitContainer}
            >
              <Grid item>
                <ErrorMessage
                  className={classes.error}
                  component="span"
                  name="selectedNextStatusEvents"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loadingProposalEvents}
                  data-cy="submit"
                >
                  Add next status events
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddNextStatusEventsToConnection.propTypes = {
  close: PropTypes.func.isRequired,
  addNextStatusEventsToConnection: PropTypes.func.isRequired,
  nextStatusEvents: PropTypes.array,
};

export default AddNextStatusEventsToConnection;
