import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import {
  Form,
  Formik,
  FormikConfig,
  FormikHelpers,
  FormikValues,
} from 'formik';
import React, { ReactNode, useState } from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from './ActionButtonContainer';
import UOLoader from './UOLoader';

interface WizardProps
  extends Pick<
    FormikConfig<FormikValues>,
    'children' | 'initialValues' | 'onSubmit'
  > {
  shouldCreate: boolean;
}

export const Wizard = ({
  children,
  initialValues,
  onSubmit,
  shouldCreate,
}: WizardProps) => {
  const theme = useTheme();
  const [stepNumber, setStepNumber] = useState(0);
  const steps = React.Children.toArray(
    children as ReactNode
  ) as React.ReactElement[];
  const [snapshot, setSnapshot] = useState(initialValues);

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

  const handleStep = (stepIndex: number, values: FormikValues) => async () => {
    const form = document.querySelector('form');

    if (form && !form.checkValidity()) {
      form.reportValidity();

      return;
    }

    setSnapshot(values);
    setStepNumber(stepIndex);
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
            sx={{
              padding: '20px 0 0',
              flexWrap: 'wrap',
            }}
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
                <Step
                  key={index}
                  {...stepProps}
                  sx={{
                    cursor: 'pointer',
                    padding: theme.spacing(1),
                  }}
                >
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
              sx={{
                marginRight: theme.spacing(1),
              }}
              variant="text"
            >
              Back
            </Button>
            <Button
              key={`step-button-${stepNumber}`}
              data-cy={isLastStep ? 'submit' : 'next-step'}
              type="submit"
              fullWidth
              sx={{
                marginRight: theme.spacing(1),
              }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting && <UOLoader size={14} />}
              {isLastStep
                ? shouldCreate
                  ? 'Create'
                  : 'Update'
                : 'Save and Continue'}
            </Button>
          </ActionButtonContainer>
        </Form>
      )}
    </Formik>
  );
};

export const WizardStep = ({
  children,
}: {
  title: string;
  validationSchema: Yup.AnyObjectSchema;
  children: React.ReactNode;
}) => <>{children}</>;
