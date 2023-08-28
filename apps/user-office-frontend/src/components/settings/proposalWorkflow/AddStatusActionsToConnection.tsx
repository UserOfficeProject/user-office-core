import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray, Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import ErrorMessage from 'components/common/ErrorMessage';
import UOLoader from 'components/common/UOLoader';
import {
  ConnectionHasActionsInput,
  EmailActionDefaultConfig,
  ProposalStatusAction,
} from 'generated/sdk';
import { useStatusActionsData } from 'hooks/settings/useStatusActionsData';

import EmailActionConfig from './EmailActionConfig';

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
  addStatusActionsToConnection: (
    connectionActions: ConnectionHasActionsInput[]
  ) => void;
  statusName?: string;
  connectionStatusActions: ProposalStatusAction[];
};

const AddStatusActionsToConnection = ({
  addStatusActionsToConnection,
  statusName,
  connectionStatusActions,
}: AddStatusActionsToConnectionProps) => {
  const classes = useStyles();

  const { statusActions, loadingStatusActions } = useStatusActionsData();

  const initialValues: {
    selectedStatusActions: ProposalStatusAction[];
    emailStatusActionConfig: { recipientsWithEmailTemplate: any[] };
  } = {
    selectedStatusActions: connectionStatusActions || [],
    emailStatusActionConfig: { recipientsWithEmailTemplate: [] },
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

  const renderActionsConfig = (
    statusAction: ProposalStatusAction,
    values: typeof initialValues
  ) => {
    switch (statusAction.type) {
      case 'EMAIL':
        return (
          <EmailActionConfig
            emailStatusActionConfig={values.emailStatusActionConfig}
            recipients={
              (statusAction.defaultConfig as EmailActionDefaultConfig)
                .recipients
            }
            emailTemplates={
              (statusAction.defaultConfig as EmailActionDefaultConfig)
                .emailTemplates
            }
          />
        );

      default:
        return <>Not configured</>;
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values): Promise<void> => {
        console.log(values);

        const emailStatusActionConfig =
          values.emailStatusActionConfig.recipientsWithEmailTemplate.map(
            (item) => ({
              recipient: item.name,
              emailTemplate: item.template.id,
            })
          );

        const connectionActions = values.selectedStatusActions.map(
          (action) => ({
            actionId: action.id,
            config: JSON.stringify(emailStatusActionConfig),
          })
        );

        addStatusActionsToConnection(connectionActions);
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
                        {renderActionsConfig(statusAction, values)}
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
