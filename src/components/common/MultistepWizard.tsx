/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
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

  const next = (values: any) => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  const previous = (values: any) => {
    setSnapshot(values);
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleStep = (step: number, values: any) => () => {
    setSnapshot(values);
    setStepNumber(step);
  };

  const handleSubmit = async (values: any, actions: FormikHelpers<any>) => {
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
            >
              Back
            </Button>
            <Button
              key={`step-button-${stepNumber}`}
              variant="contained"
              color="primary"
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
  validationSchema: Yup.ObjectSchema;
}> = ({ children }) => <>{children}</>;
