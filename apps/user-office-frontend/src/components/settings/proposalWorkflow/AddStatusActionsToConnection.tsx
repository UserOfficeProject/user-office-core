import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray, Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import ErrorMessage from 'components/common/ErrorMessage';
import UOLoader from 'components/common/UOLoader';

const addStatusChangingEventsToConnectionValidationSchema = yup.object().shape({
  selectedStatusChangingEvents: yup
    .array()
    .of(yup.string())
    .min(1, 'You must select at least one event')
    .required('You must select at least one event'),
});

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '20px',
    padding: '22px 0 0',
    '& .statusName': {
      fontWeight: 'bold',
    },
  },
  container: {
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

type AddStatusActionsToConnectionProps = {
  addStatusActionsToConnection: (statusActions: any[]) => void;
  statusName?: string;
  connectionStatusActions: any[];
};

const AddStatusActionsToConnection = ({
  addStatusActionsToConnection,
  statusName,
  connectionStatusActions,
}: AddStatusActionsToConnectionProps) => {
  const classes = useStyles();

  const { statusActions, loadingStatusActions } = {
    statusActions: [
      {
        id: 1,
        name: 'Email Action',
        type: 'EMAIL',
        defaultConfig: {},
        description: 'This is description',
        config: {},
        recipients: [
          {
            id: 'PI',
            description: 'Principal investigator on the proposal',
            template: { id: '', name: '' },
          },
          {
            id: 'CO_PROPOSERS',
            description: 'Co-proposers on the proposal',
            template: { id: '', name: '' },
          },
          {
            id: 'INSTRUMENT_SCIENTISTS',
            description:
              'Instrument scientists including the manager on the instrument related to the proposal',
            template: { id: '', name: '' },
          },
          {
            id: 'SEP_REVIEWERS',
            description:
              'SEP reviewers that are assigned to review the proposal',
            template: { id: '', name: '' },
          },
        ],
      },
      {
        id: 2,
        name: 'RabbitMQ Action',
        type: 'RABBITMQ',
        defaultConfig: {},
        description: 'This is not configured yet',
        config: {},
      },
    ],
    loadingStatusActions: false,
  };

  const emailTemplates = [
    { id: 'test-template', name: 'test template' },
    { id: 'test-template-multiple', name: 'test template multiple' },
  ];

  const initialValues: {
    selectedStatusActions: any[];
    emailStatusActionRecipients: any[];
  } = {
    selectedStatusActions: connectionStatusActions || [],
    emailStatusActionRecipients: [],
  };

  const accordionSX = {
    '.MuiAccordionSummary-root': {
      '&.Mui-expanded': {
        backgroundColor: '#f3f4f6',
      },
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
    },
  };

  console;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        console.log(values);
        // addStatusActionsToConnection(values.selectedStatusActions);
      }}
      // validationSchema={addStatusChangingEventsToConnectionValidationSchema}
    >
      {({ isSubmitting, values }): JSX.Element => (
        <Form>
          <Typography className={classes.cardHeader}>
            Status actions that will be executed when proposals change to{' '}
            <span className="statusName">{statusName}</span> status
          </Typography>

          {loadingStatusActions ? (
            <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
          ) : (
            <FieldArray
              name="selectedStatusActions"
              render={(arrayHelpers) => (
                <>
                  {statusActions.map((statusAction, index) => (
                    <Accordion sx={accordionSX} disableGutters key={index}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}- header`}
                        id={`panel${index}-header`}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              id={statusAction.name}
                              name="selectedStatusActions"
                              value={statusAction.id}
                              checked={
                                !!values.selectedStatusActions.find(
                                  (item) => item.id === statusAction.id
                                )
                              }
                              data-cy="status-changing-event"
                              onChange={(e) => {
                                if (e.target.checked)
                                  arrayHelpers.push(statusAction);
                                else {
                                  const idx =
                                    values.selectedStatusActions.findIndex(
                                      (item) => item.id === statusAction.id
                                    );
                                  arrayHelpers.remove(idx);
                                }
                              }}
                              inputProps={{
                                'aria-label': 'primary checkbox',
                              }}
                            />
                          }
                          label={
                            <>
                              <p>{statusAction.name}</p>
                              <p className={classes.eventDescription}>
                                {statusAction.description}
                              </p>
                            </>
                          }
                        />
                      </AccordionSummary>
                      <AccordionDetails>
                        <FieldArray
                          name="emailStatusActionRecipients"
                          render={(arrayHelpers) => (
                            <>
                              <Typography variant="h6" color="black">
                                Email recipients:{' '}
                              </Typography>
                              {statusAction.recipients?.map(
                                (recipient, index) => (
                                  <Grid key={index} container paddingX={1}>
                                    <Grid item sm={6}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            id={recipient.id}
                                            name="emailStatusActionRecipients"
                                            value={recipient.id}
                                            checked={
                                              !!values.emailStatusActionRecipients.find(
                                                (item) =>
                                                  item.id === recipient.id
                                              )
                                            }
                                            data-cy={`action-recipient-${recipient.id}`}
                                            onChange={(e) => {
                                              if (e.target.checked)
                                                arrayHelpers.push(recipient);
                                              else {
                                                const idx =
                                                  values.emailStatusActionRecipients.findIndex(
                                                    (item) =>
                                                      item.id === recipient.id
                                                  );
                                                arrayHelpers.remove(idx);
                                              }
                                            }}
                                            inputProps={{
                                              'aria-label': 'primary checkbox',
                                            }}
                                          />
                                        }
                                        label={recipient.id}
                                      />
                                      <p className={classes.eventDescription}>
                                        {recipient.description}
                                      </p>
                                    </Grid>
                                    <Grid item sm={6}>
                                      {values.emailStatusActionRecipients.findIndex(
                                        (item) => item.id === recipient.id
                                      ) !== -1 && (
                                        <Autocomplete
                                          id="recipient-template"
                                          options={emailTemplates}
                                          getOptionLabel={(option) =>
                                            option.name
                                          }
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              margin="none"
                                              label="Email template"
                                            />
                                          )}
                                          onChange={(_event, newValue) => {
                                            const idx =
                                              values.emailStatusActionRecipients.findIndex(
                                                (item) =>
                                                  item.id === recipient.id
                                              );
                                            const newTemplateValue = {
                                              ...values
                                                .emailStatusActionRecipients[
                                                idx
                                              ],
                                              template: newValue,
                                            };

                                            arrayHelpers.replace(
                                              idx,
                                              newTemplateValue
                                            );
                                          }}
                                          value={
                                            values.emailStatusActionRecipients.find(
                                              (item) => item.id === recipient.id
                                            )?.template || null
                                          }
                                          data-cy="value"
                                        />
                                      )}
                                    </Grid>
                                  </Grid>
                                )
                              )}
                            </>
                          )}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </>
              )}
            />
          )}
          <Grid container justifyContent="flex-end" spacing={1} paddingTop={1}>
            <Grid item marginTop={1}>
              <ErrorMessage name="selectedStatusActions" />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                disabled={isSubmitting || loadingStatusActions}
                data-cy="submit"
              >
                Add status actions
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AddStatusActionsToConnection;
