import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { FieldArray, Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import ErrorMessage from 'components/common/ErrorMessage';
import UOLoader from 'components/common/UOLoader';
import { Event } from 'generated/sdk';
import { useEventsData } from 'hooks/settings/useEventsData';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';

const addStatusChangingEventsToConnectionValidationSchema = yup.object().shape({
  selectedStatusChangingEvents: yup
    .array()
    .of(yup.string())
    .min(1, 'You must select at least one event')
    .required('You must select at least one event'),
});

type AddStatusChangingEventsToConnectionProps = {
  addStatusChangingEventsToConnection: (statusChangingEvents: string[]) => void;
  statusChangingEvents?: Event[];
  statusName?: string;
  isLoading: boolean;
  entityType: 'proposal' | 'experiment';
};

const AddStatusChangingEventsToConnection = ({
  statusChangingEvents,
  addStatusChangingEventsToConnection,
  statusName,
  isLoading,
  entityType,
}: AddStatusChangingEventsToConnectionProps) => {
  const theme = useTheme();
  const { events, loadingEvents } = useEventsData(entityType);

  const initialValues: {
    selectedStatusChangingEvents: Event[];
  } = {
    selectedStatusChangingEvents: statusChangingEvents || [],
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        addStatusChangingEventsToConnection(
          values.selectedStatusChangingEvents
        );
      }}
      validationSchema={addStatusChangingEventsToConnectionValidationSchema}
    >
      {({ isSubmitting, values }): JSX.Element => (
        <Form>
          <Typography
            sx={{
              fontSize: '20px',
              padding: '22px 0 0',
              '& .statusName': BOLD_TEXT_STYLE,
            }}
          >
            Events that will trigger the change to{' '}
            <span className="statusName">{statusName}</span> status
          </Typography>

          <Grid
            container
            spacing={1}
            sx={{
              minHeight: 'auto',
              maxHeight: 'calc(100vh - 315px)',
              [theme.breakpoints.only('sm')]: {
                maxHeight: 'calc(100vh - 345px)',
              },
              [theme.breakpoints.only('xs')]: {
                maxHeight: 'calc(100vh - 475px)',
              },
              overflowY: 'auto',
              overflowX: 'hidden',
              marginTop: '10px',
            }}
          >
            {loadingEvents ? (
              <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
            ) : (
              <FieldArray
                name="selectedStatusChangingEvents"
                render={(arrayHelpers) => (
                  <>
                    {events.map((event, index) => (
                      <Grid key={index} item sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              id={event.name}
                              name="selectedStatusChangingEvents"
                              value={event.name}
                              checked={values.selectedStatusChangingEvents.includes(
                                event.name
                              )}
                              data-cy="status-changing-event"
                              onChange={(e) => {
                                if (e.target.checked)
                                  arrayHelpers.push(event.name);
                                else {
                                  const idx =
                                    values.selectedStatusChangingEvents.indexOf(
                                      event.name
                                    );
                                  arrayHelpers.remove(idx);
                                }
                              }}
                              inputProps={{
                                'aria-label': 'primary checkbox',
                              }}
                            />
                          }
                          label={event.name}
                        />
                        <Box
                          component="p"
                          sx={{
                            margin: '-5px 0',
                            fontSize: 'small',
                            color: theme.palette.grey[400],
                          }}
                        >
                          {event.description}
                        </Box>
                      </Grid>
                    ))}
                  </>
                )}
              />
            )}
          </Grid>
          <Grid container justifyContent="flex-end" spacing={1} paddingTop={1}>
            <Grid item marginTop={1}>
              <ErrorMessage name="selectedStatusChangingEvents" />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                disabled={isSubmitting || loadingEvents || isLoading}
                data-cy="submit"
              >
                {isLoading && <UOLoader size={20} />}
                Add status changing events
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AddStatusChangingEventsToConnection;
