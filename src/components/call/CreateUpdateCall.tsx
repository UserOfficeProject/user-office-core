import {
  createCallValidationSchema,
  updateCallValidationSchema,
} from '@esss-swap/duo-validation/lib/Call';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik, FormikErrors } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import UOLoader from 'components/common/UOLoader';
import { Call } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CallGeneralInfo from './CallGeneralInfo';
import CallNotificationAndCycleInfo from './CallNotificationAndCycleInfo';
import CallReviewsInfo from './CallReviewsInfo';

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
    step: {
      cursor: 'pointer',
    },
  })
);

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const steps = ['General', 'Reviews', 'Notification and cycle'];

const getFieldStep = (field: string) => {
  switch (field) {
    case 'shortCode':
    case 'startCall':
    case 'endCall':
    case 'templateId':
    case 'proposalWorkflowId':
      return steps[0];
    case 'startReview':
    case 'endReview':
    case 'startSEPReview':
    case 'endSEPReview':
    case 'surveyComment':
      return steps[1];
    case 'startNotify':
    case 'endNotify':
    case 'startCycle':
    case 'endCycle':
    case 'cycleComment':
      return steps[2];
    default:
      return 'unknown step';
  }
};

const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      return <CallGeneralInfo />;
    case 1:
      return <CallReviewsInfo />;
    case 2:
      return <CallNotificationAndCycleInfo />;
    default:
      return 'Unknown step';
  }
};

const CreateUpdateCall: React.FC<CreateUpdateCallProps> = ({ call, close }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const classes = useStyles();
  let isLastStep = false;

  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);

  const currentDayEnd = new Date();
  currentDayEnd.setHours(23, 59, 59, 999);

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
    ? {
        ...call,
        templateId: call.templateId || '',
        proposalWorkflowId: call.proposalWorkflowId || '',
      }
    : {
        shortCode: '',
        startCall: currentDayStart,
        endCall: currentDayEnd,
        startReview: currentDayStart,
        endReview: currentDayEnd,
        startSEPReview: null,
        endSEPReview: null,
        startNotify: currentDayStart,
        endNotify: currentDayEnd,
        startCycle: currentDayStart,
        endCycle: currentDayEnd,
        cycleComment: '',
        surveyComment: '',
        proposalWorkflowId: '',
        templateId: '',
      };

  const closeModal = (error: string | null | undefined, callToReturn: Call) => {
    if (error) {
      close(null);
    } else {
      close(callToReturn);
    }
  };

  if (activeStep + 1 === steps.length) {
    isLastStep = true;
  }

  const showFormErrors = (errors: FormikErrors<Call>): JSX.Element | null => {
    const errorsToShow: Array<[string, string]> = [];

    for (const [key, value] of Object.entries(errors)) {
      if (errors.hasOwnProperty(key)) {
        if (value) {
          errorsToShow.push([key, value.toString()]);
        }
      }
    }

    if (errorsToShow.length > 0) {
      return (
        <FormHelperText className={classes.formErrors}>
          {errorsToShow.map(([key, errorToShow]) => (
            <span key={key}>
              {getFieldStep(key)}: {errorToShow}
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
            <Step key={label} {...stepProps} className={classes.step}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, actions): Promise<void> => {
          const { templateId, proposalWorkflowId } = values;
          if (call) {
            const data = await api('Call updated successfully!').updateCall({
              id: call.id,
              ...values,
              templateId: templateId ? +templateId : null,
              proposalWorkflowId: proposalWorkflowId
                ? +proposalWorkflowId
                : null,
            });
            closeModal(data.updateCall.error, data.updateCall.call as Call);
          } else {
            const data = await api('Call created successfully!').createCall({
              ...values,
              templateId: templateId ? +templateId : null,
              proposalWorkflowId: proposalWorkflowId
                ? +proposalWorkflowId
                : null,
            });

            closeModal(data.createCall.error, data.createCall.call as Call);
          }

          actions.setSubmitting(false);
        }}
        validationSchema={
          call ? updateCallValidationSchema : createCallValidationSchema
        }
      >
        {({ errors, submitCount }): JSX.Element => (
          <Form>
            {getStepContent(activeStep)}
            {submitCount > 0 && showFormErrors(errors)}
            <ActionButtonContainer>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                fullWidth
                className={classes.button}
              >
                Back
              </Button>
              <Button
                key={`step-button-${activeStep}`}
                variant="contained"
                color="primary"
                data-cy={isLastStep ? 'submit' : 'next-step'}
                type={isLastStep ? 'submit' : 'button'}
                fullWidth
                onClick={isLastStep ? () => null : handleNext}
                className={classes.button}
                disabled={isExecutingCall}
              >
                {isExecutingCall && <UOLoader size={14} />}
                {isLastStep ? (call ? 'Update Call' : 'Add Call') : 'Next'}
              </Button>
            </ActionButtonContainer>
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
