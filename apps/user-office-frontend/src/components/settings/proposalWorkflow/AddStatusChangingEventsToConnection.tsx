import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import * as yup from 'yup';

import ErrorMessage from 'components/common/ErrorMessage';
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
    minHeight: 'auto',
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    marginTop: '10px',
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

const AddStatusChangingEventsToConnection: React.FC<
  AddStatusChangingEventsToConnectionProps
> = ({
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
    <Container component="main">
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
                                data-cy="status-changing-event"
                                onChange={(e) => {
                                  if (e.target.checked)
                                    arrayHelpers.push(proposalEvent.name);
                                  else {
                                    const idx =
                                      values.selectedStatusChangingEvents.indexOf(
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
              justifyContent="flex-end"
              className={classes.submitContainer}
            >
              <Grid item>
                <ErrorMessage name="selectedStatusChangingEvents" />

                <Button
                  type="submit"
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
