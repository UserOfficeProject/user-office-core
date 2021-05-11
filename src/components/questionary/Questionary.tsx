import { makeStyles, Step, Stepper, Typography } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React, { useContext, useRef, useEffect } from 'react';

import { useCheckAccess } from 'components/common/Can';
import { UserRole } from 'generated/sdk';
import { EventType, WizardStep } from 'models/QuestionarySubmissionState';

import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from './QuestionaryContext';
import { QuestionaryStepButton } from './QuestionaryStepButton';

interface QuestionaryProps {
  title: string;
  info?: string;
  displayElementFactory: (
    metadata: WizardStep,
    isReadonly: boolean
  ) => React.ReactNode;
  handleReset: () => Promise<boolean>;
}

function Questionary({
  title,
  info,
  handleReset,
  displayElementFactory,
}: QuestionaryProps) {
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');

  const useStyles = makeStyles((theme) => ({
    stepper: {
      margin: theme.spacing(3, 0),
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
      width: 'inherit',
      minWidth: isTabletOrMobile ? 'inherit' : '500px', // Giving some minimum width for questionaries with short entries
    },
  }));

  const classes = useStyles();
  const { state, dispatch } = useContext(QuestionaryContext);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const titleRef = useRef<HTMLElement | null>(null);
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
      >
        {state.wizardSteps.map((wizardStep, index) => {
          const stepMetadata = wizardStep.getMetadata(
            state,
            wizardStep.payload
          );

          return (
            <Step key={index}>
              <QuestionaryStepButton
                onClick={async () => {
                  if (!state.isDirty) {
                    await handleReset();
                    dispatch({
                      type: EventType.GO_TO_STEP,
                      payload: { stepIndex: index },
                    });
                  } else {
                    if (
                      window.confirm(
                        'Changes you recently made in this step will not be saved! Are you sure?'
                      )
                    ) {
                      await handleReset();
                      dispatch({
                        type: EventType.GO_TO_STEP,
                        payload: { stepIndex: index },
                      });
                    }
                  }
                }}
                completed={stepMetadata.isCompleted}
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

    return displayElementFactory(
      currentStep,
      stepMetadata.isReadonly && !isUserOfficer
    );
  };

  return (
    <div className={classes.root}>
      <Typography
        variant="h4"
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
