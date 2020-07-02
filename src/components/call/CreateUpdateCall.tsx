import DateFnsUtils from '@date-io/date-fns';
import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import {
  createCallValidationSchema,
  updateCallValidationSchema,
} from '@esss-swap/duo-validation';
import {
  Stepper,
  Step,
  createStyles,
  makeStyles,
  Theme,
  StepLabel,
  Grid,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { Call } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useProposalsTemplates } from '../../hooks/useProposalTemplates';
import FormikDropdown from '../common/FormikDropdown';
import FormikUICustomDatePicker from '../common/FormikUICustomDatePicker';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const CreateUpdateCall: React.FC<CreateUpdateCallProps> = ({ call, close }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const api = useDataApi();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { templates } = useProposalsTemplates(false);
  const currentDay = new Date();

  const getSteps = () => {
    return ['General info', 'Review and notification', 'Cycle info'];
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Field
              name="shortCode"
              label="Short Code"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="short-code"
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Field
                name="startCall"
                label="Start"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
                data-cy="start-date"
              />

              <Field
                name="endCall"
                label="End"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
                data-cy="end-date"
              />
            </MuiPickersUtilsProvider>
            {templates.length > 0 && (
              <FormikDropdown
                name="templateId"
                label="Call template"
                items={templates.map(template => ({
                  text: template.name,
                  value: template.templateId,
                }))}
                data-cy="call-template"
              />
            )}
          </>
        );
      case 1:
        return (
          <>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Field
                name="startReview"
                label="Start of review"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
                data-cy="start-review"
              />
              <Field
                name="endReview"
                label="End of review"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
              />
              <Field
                name="startNotify"
                label="Start of notification period"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
              />
              <Field
                name="endNotify"
                label="End of notification period"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
              />
            </MuiPickersUtilsProvider>
            <Field
              name="surveyComment"
              label="Survey Comment"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="survey-comment"
            />
          </>
        );
      case 2:
        return (
          <>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Field
                name="startCycle"
                label="Start of cycle"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
                data-cy="start-cycle"
              />
              <Field
                name="endCycle"
                label="End of cycle"
                component={FormikUICustomDatePicker}
                margin="normal"
                fullWidth
                data-cy="end-cycle"
              />
            </MuiPickersUtilsProvider>
            <Field
              name="cycleComment"
              label="Cycle comment"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="cycle-comment"
            />
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const initialValues = call
    ? { ...call, templateId: call.templateId || '' }
    : {
        shortCode: '',
        startCall: currentDay,
        endCall: currentDay,
        startReview: currentDay,
        endReview: currentDay,
        startNotify: currentDay,
        endNotify: currentDay,
        cycleComment: '',
        surveyComment: '',
        templateId: '',
      };

  const showNotificationAndClose = (
    error: string | null | undefined,
    callToReturn: Call
  ) => {
    if (error) {
      enqueueSnackbar(getTranslation(error as ResourceId), {
        variant: 'error',
      });
      close(null);
    } else {
      close(callToReturn);
    }
  };

  return (
    <>
      <Typography variant="h6">
        {call ? 'Update the call' : 'Create new call'}
      </Typography>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean; onClick: () => void } = {
            onClick: handleStep(index),
          };
          const labelProps: { optional?: React.ReactNode } = {};

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, actions): Promise<void> => {
          const { templateId } = values;
          if (call) {
            await api()
              .updateCall({
                id: call.id,
                ...values,
                templateId: templateId ? +templateId : null,
              })
              .then(data => {
                showNotificationAndClose(
                  data.updateCall.error,
                  data.updateCall.call as Call
                );
              });
          } else {
            await api()
              .createCall({
                ...values,
                templateId: templateId ? +templateId : null,
              })
              .then(data => {
                showNotificationAndClose(
                  data.createCall.error,
                  data.createCall.call as Call
                );
              });
          }

          actions.setSubmitting(false);
        }}
        validationSchema={
          call ? updateCallValidationSchema : createCallValidationSchema
        }
      >
        <Form>
          {getStepContent(activeStep)}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                fullWidth
                className={classes.button}
              >
                Back
              </Button>
            </Grid>
            <Grid item xs={9}>
              {activeStep !== steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleNext}
                  className={classes.button}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  data-cy="submit"
                >
                  {call ? 'Update' : 'Add'} Call
                </Button>
              )}
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </>
  );
};

CreateUpdateCall.propTypes = {
  close: PropTypes.func.isRequired,
  call: PropTypes.any,
};

export default CreateUpdateCall;
