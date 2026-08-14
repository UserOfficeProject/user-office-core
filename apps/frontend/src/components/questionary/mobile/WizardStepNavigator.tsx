import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

export type WizardNavigatorStep = {
  title: string;
  completed?: boolean;
  secondary?: string;
};

type WizardStepNavigatorProps = {
  open: boolean;
  onClose: () => void;
  steps: WizardNavigatorStep[];
  activeStep: number;
  onSelect: (index: number) => void;
};

export default function WizardStepNavigator({
  open,
  onClose,
  steps,
  activeStep,
  onSelect,
}: WizardStepNavigatorProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      transitionDuration={reduceMotion ? 0 : undefined}
      data-cy="wizard-step-navigator"
      // A Drawer sits below Dialog by default, and the wizard is rendered
      // inside one for sample declarations and generic templates.
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            paddingBottom: 1.5,
          },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 4,
          borderRadius: 1,
          backgroundColor: 'action.disabled',
          margin: '10px auto',
        }}
      />
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.4,
          paddingX: 2.5,
          paddingTop: 0.5,
          paddingBottom: 1.25,
        }}
      >
        Steps
      </Typography>
      <Stepper
        nonLinear
        orientation="vertical"
        activeStep={activeStep}
        sx={{ paddingX: 2.5 }}
      >
        {steps.map((step, index) => (
          <Step key={`${index}-${step.title}`} completed={step.completed}>
            <StepButton
              onClick={() => {
                onClose();
                onSelect(index);
              }}
              optional={
                step.secondary && (
                  <Typography variant="caption" color="text.secondary">
                    {step.secondary}
                  </Typography>
                )
              }
              data-cy={`wizard-step-navigator-step-${index}`}
              sx={(theme) => ({
                minHeight: minTouchTarget(theme),
                textAlign: 'left',
              })}
            >
              {step.title}
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Drawer>
  );
}
