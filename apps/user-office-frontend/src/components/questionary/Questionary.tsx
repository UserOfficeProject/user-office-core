import { Step, Stepper, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
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
}

function Questionary({ title, info }: QuestionaryProps) {
  const isMobile = useMediaQuery('(max-width: 500px)');

  const useStyles = makeStyles((theme) => ({
    stepper: {
      margin: theme.spacing(3, 0),
      padding: theme.spacing(0, 1),
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        webkitAppearance: 'none',
        maxWidth: '10px',
      },
      '&::-webkit-scrollbar-thumb': {
        border: '7px solid white',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
    },
    header: {
      textAlign: 'center',
    },
    subHeader: {
      color: theme.palette.grey[700],
      textAlign: 'right',
    },
    root: {
      width: '100%',
      minWidth: isMobile ? 'inherit' : '500px', // Giving some minimum width for questionaries with short entries
    },
  }));

  const classes = useStyles();
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
    // if there are less than 2 steps then there is no need to show the wizard navigation
    if (state.wizardSteps.length < 2) {
      return null;
    }

    return (
      <Stepper
        nonLinear
        activeStep={state.stepIndex}
        className={classes.stepper}
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
      stepMetadata.isReadonly && !isUserOfficer
    );
  };

  return (
    <div className={classes.root}>
      <Typography
        variant="h4"
        component="h2"
        className={classes.header}
        ref={titleRef}
        data-cy="questionary-title"
      >
        {title}
      </Typography>
      <Typography className={classes.subHeader}>{info}</Typography>
      {getStepperNavig()}
      {getStepContent()}
    </div>
  );
}

export default Questionary;
