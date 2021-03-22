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

const addStatusChangingEventsToConnectionValidationSchema = yup.object().shape({
  selectedStatusChangingEvents: yup
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
    '& .statusName': {
      fontWeight: 'bold',
    },
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

type AddStatusChangingEventsToConnectionProps = {
  close: () => void;
  addStatusChangingEventsToConnection: (statusChangingEvents: string[]) => void;
  statusChangingEvents?: Event[];
  statusName?: string;
};

const AddStatusChangingEventsToConnection: React.FC<AddStatusChangingEventsToConnectionProps> = ({
  statusChangingEvents,
  close,
  addStatusChangingEventsToConnection,
  statusName,
}) => {
  const classes = useStyles();

  const { proposalEvents, loadingProposalEvents } = useProposalEventsData();

  const initialValues: {
    selectedStatusChangingEvents: Event[];
  } = {
    selectedStatusChangingEvents: statusChangingEvents || [],
  };

  return (
    <Container component="main" maxWidth="md">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          addStatusChangingEventsToConnection(
            values.selectedStatusChangingEvents
          );
          close();
        }}
        validationSchema={addStatusChangingEventsToConnectionValidationSchema}
      >
        {({ isSubmitting, values }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Events that will trigger the change to{' '}
              <span className="statusName">{statusName}</span> status
            </Typography>

            <Grid container spacing={1} className={classes.container}>
              {loadingProposalEvents ? (
                <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
              ) : (
                <FieldArray
                  name="selectedStatusChangingEvents"
                  render={(arrayHelpers) => (
                    <>
                      {proposalEvents.map((proposalEvent, index) => (
                        <Grid key={index} item sm={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={proposalEvent.name}
                                name="selectedStatusChangingEvents"
                                value={proposalEvent.name}
                                checked={values.selectedStatusChangingEvents.includes(
                                  proposalEvent.name
                                )}
                                color="primary"
                                data-cy="status-changing-event"
                                onChange={(e) => {
                                  if (e.target.checked)
                                    arrayHelpers.push(proposalEvent.name);
                                  else {
                                    const idx = values.selectedStatusChangingEvents.indexOf(
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
                  name="selectedStatusChangingEvents"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loadingProposalEvents}
                  data-cy="submit"
                >
                  Add status changing events
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddStatusChangingEventsToConnection.propTypes = {
  close: PropTypes.func.isRequired,
  addStatusChangingEventsToConnection: PropTypes.func.isRequired,
  statusChangingEvents: PropTypes.array,
};

export default AddStatusChangingEventsToConnection;
