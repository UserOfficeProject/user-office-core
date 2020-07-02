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
  FormHelperText,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Form, Formik, FormikErrors } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { Call } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import CallCycleInfo from './CallCycleInfo';
import CallGeneralInfo from './CallGeneralInfo';
import CallReviewAndNotification from './CallReviewAndNotification';

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
    stepper: {
      padding: '20px 0 0',
    },
    formErrors: {
      color: theme.palette.error.main,
      marginBottom: '10px',
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
  const currentDay = new Date();
  let isLastStep = false;

  const steps = ['General info', 'Review and notification', 'Cycle info'];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CallGeneralInfo />;
      case 1:
        return <CallReviewAndNotification />;
      case 2:
        return <CallCycleInfo />;
      default:
        return 'Unknown step';
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

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
        startCycle: currentDay,
        endCycle: currentDay,
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

  if (activeStep + 1 === steps.length) {
    isLastStep = true;
  }

  const showFormErrors = (errors: FormikErrors<Call>): JSX.Element | null => {
    const errorsToShow: string[] = [];

    for (const [key, value] of Object.entries(errors)) {
      if (errors.hasOwnProperty(key)) {
        if (value) {
          errorsToShow.push(value.toString());
        }
      }
    }

    if (errorsToShow.length > 0) {
      return (
        <FormHelperText className={classes.formErrors}>
          {errorsToShow.map((errorToShow, index) => (
            <span key={index}>
              {errorToShow}
              <br />
            </span>
          ))}
        </FormHelperText>
      );
    }

    return null;
  };

  return (
    <>
      <Typography variant="h6">
        {call ? 'Update the call' : 'Create new call'}
      </Typography>
      <Stepper nonLinear activeStep={activeStep} className={classes.stepper}>
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
        {({ errors }): JSX.Element => (
          <Form>
            {getStepContent(activeStep)}
            {activeStep === 2 && showFormErrors(errors)}
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
                <Button
                  variant="contained"
                  color="primary"
                  data-cy="submit"
                  type={isLastStep ? 'submit' : 'button'}
                  fullWidth
                  onClick={isLastStep ? () => null : handleNext}
                  className={classes.button}
                >
                  {isLastStep ? (call ? 'Update Call' : 'Add Call') : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

CreateUpdateCall.propTypes = {
  close: PropTypes.func.isRequired,
  call: PropTypes.any,
};

export default CreateUpdateCall;
