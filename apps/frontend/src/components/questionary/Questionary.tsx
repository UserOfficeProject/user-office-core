import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useContext, useRef, useEffect } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { UserRole } from 'generated/sdk';

import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from './QuestionaryContext';
import { getQuestionaryDefinition } from './QuestionaryRegistry';
import { QuestionaryStepButton } from './QuestionaryStepButton';

interface QuestionaryProps {
  title: string;
  info?: JSX.Element | string;
  previewMode?: boolean;
}

function Questionary({ title, info, previewMode = false }: QuestionaryProps) {
  const isMobile = useMediaQuery('(max-width: 500px)');

  const theme = useTheme();
  const { state, dispatch } = useContext(QuestionaryContext);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const activeStep = state?.stepIndex;

  useEffect(() => {
    if (activeStep !== undefined && titleRef.current) {
      titleRef.current.scrollIntoView();
    }
  }, [activeStep]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const getStepperNavig = () => {
    // if there are fewer than 2 steps then there is no need to show the wizard navigation
    if (state.wizardSteps.length < 2) {
      return null;
    }

    return (
      <Stepper
        nonLinear
        activeStep={state.stepIndex}
        sx={{
          margin: theme.spacing(3, 0),
          padding: theme.spacing(0, 1),
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
        data-cy="questionary-stepper"
      >
        {state.wizardSteps.map((wizardStep, index) => {
          const stepMetadata = wizardStep.getMetadata(
            state,
            wizardStep.payload
          );

          return (
            <Step key={index} completed={stepMetadata.isCompleted}>
              <QuestionaryStepButton
                onClick={async () => {
                  dispatch({
                    type: 'GO_TO_STEP_CLICKED',
                    stepIndex: index,
                  });
                }}
                readonly={stepMetadata.isReadonly && !isUserOfficer}
              >
                <span>{stepMetadata.title}</span>
              </QuestionaryStepButton>
            </Step>
          );
        })}
      </Stepper>
    );
  };

  const getStepContent = () => {
    const currentStep = state.wizardSteps[state.stepIndex];

    const stepMetadata = currentStep.getMetadata(state, currentStep.payload);

    if (!currentStep) {
      return null;
    }

    const { displayElementFactory } = getQuestionaryDefinition(
      state.templateGroupId
    );

    return displayElementFactory.getDisplayElement(
      currentStep,
      (stepMetadata.isReadonly && !isUserOfficer) || previewMode
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: isMobile ? 'inherit' : '500px',
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{ textAlign: 'center' }}
        ref={titleRef}
        data-cy="questionary-title"
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: theme.palette.grey[700],
          textAlign: 'right',
        }}
      >
        {info}
      </Typography>
      {getStepperNavig()}
      {getStepContent()}
    </Box>
  );
}

export default Questionary;
