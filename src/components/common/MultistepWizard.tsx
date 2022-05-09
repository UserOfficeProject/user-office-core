import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import makeStyles from '@mui/styles/makeStyles';
import {
  Form,
  Formik,
  FormikConfig,
  FormikHelpers,
  FormikValues,
} from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from './ActionButtonContainer';
import UOLoader from './UOLoader';

const useStyles = makeStyles((theme) => ({
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
    flexWrap: 'wrap',
  },
  formErrors: {
    color: theme.palette.error.main,
    marginBottom: '10px',
  },
  step: {
    cursor: 'pointer',
    padding: theme.spacing(1),
  },
}));

interface WizardProps
  extends Pick<
    FormikConfig<FormikValues>,
    'children' | 'initialValues' | 'onSubmit'
  > {
  shouldCreate: boolean;
}

export const Wizard: React.FC<WizardProps> = ({
  children,
  initialValues,
  onSubmit,
  shouldCreate,
}) => {
  const [stepNumber, setStepNumber] = useState(0);
  const steps = React.Children.toArray(children) as React.ReactElement[];
  const [snapshot, setSnapshot] = useState(initialValues);
  const classes = useStyles();

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  const next = (values: FormikValues) => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  const previous = (values: FormikValues) => {
    setSnapshot(values);
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleStep = (step: number, values: FormikValues) => () => {
    setSnapshot(values);
    setStepNumber(step);
  };

  const handleSubmit = async (
    values: FormikValues,
    actions: FormikHelpers<FormikValues>
  ) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, actions);
    }
    if (isLastStep) {
      return await onSubmit(values, actions);
    } else {
      actions.setTouched({});
      next(values);
    }
  };

  return (
    <Formik
      initialValues={snapshot}
      onSubmit={handleSubmit}
      validationSchema={step.props.validationSchema}
    >
      {(formik) => (
        <Form>
          <Stepper
            nonLinear
            activeStep={stepNumber}
            className={classes.stepper}
          >
            {steps.map((stepItem, index) => {
              const stepProps: {
                completed?: boolean;
                onClick: () => void;
              } = {
                onClick: handleStep(index, formik.values),
              };
              const labelProps: { optional?: React.ReactNode } = {};

              return (
                <Step key={index} {...stepProps} className={classes.step}>
                  <StepLabel {...labelProps}>{stepItem.props.title}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {step}
          <ActionButtonContainer>
            <Button
              disabled={stepNumber === 0 || formik.isSubmitting}
              onClick={() => previous(formik.values)}
              fullWidth
              className={classes.button}
              variant="text"
            >
              Back
            </Button>
            <Button
              key={`step-button-${stepNumber}`}
              data-cy={isLastStep ? 'submit' : 'next-step'}
              type="submit"
              fullWidth
              className={classes.button}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting && <UOLoader size={14} />}
              {isLastStep ? (shouldCreate ? 'Create' : 'Update') : 'Next'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
};

export const WizardStep: React.FC<{
  title: string;
  validationSchema: Yup.AnyObjectSchema;
}> = ({ children }) => <>{children}</>;
