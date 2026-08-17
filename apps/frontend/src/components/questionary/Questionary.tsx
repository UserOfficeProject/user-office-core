import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MobileAppBar from 'components/common/mobile/MobileAppBar';
import { DialogAppBarContext } from 'components/common/StyledDialog';
import { UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { toolbarHeight, useIsMobile } from 'hooks/common/useResponsive';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import {
  WizardHeaderProvider,
  useWizardHeader,
} from './mobile/WizardHeaderContext';
import WizardStepBar from './mobile/WizardStepBar';
import WizardStepNavigator, {
  WizardNavigatorStep,
} from './mobile/WizardStepNavigator';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from './QuestionaryContext';
import { getQuestionaryDefinition } from './QuestionaryRegistry';
import { QuestionaryStepButton } from './QuestionaryStepButton';

const PROGRESS_HEIGHT = 3;

interface QuestionaryProps {
  title: string;
  info?: React.ReactNode;
  previewMode?: boolean;
  confirm: WithConfirmType;
}

function Questionary({
  title,
  info,
  previewMode = false,
  confirm,
}: QuestionaryProps) {
  const isMobile = useIsMobile();

  const theme = useTheme();
  const navigate = useNavigate();
  const hasDialogAppBar = useContext(DialogAppBarContext);
  const header = useWizardHeader();
  const { state, dispatch } = useContext(QuestionaryContext);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const activeStep = state?.stepIndex;

  useEffect(() => {
    if (!isMobile && activeStep !== undefined && titleRef.current) {
      titleRef.current.scrollIntoView();
    }
  }, [activeStep, isMobile]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const goToStep = (stepIndex: number) =>
    dispatch({ type: 'GO_TO_STEP_CLICKED', stepIndex, confirm });

  const stepsMetadata = state.wizardSteps.map((wizardStep) =>
    wizardStep.getMetadata(state, wizardStep.payload)
  );
  const isStepLocked = (index: number) =>
    stepsMetadata[index].isReadonly && !isUserOfficer;

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
        {stepsMetadata.map((stepMetadata, index) => (
          <Step key={index} completed={stepMetadata.isCompleted}>
            <QuestionaryStepButton
              onClick={async () => {
                goToStep(index);
              }}
              readonly={isStepLocked(index)}
            >
              <span>{stepMetadata.title}</span>
            </QuestionaryStepButton>
          </Step>
        ))}
      </Stepper>
    );
  };

  const getStepContent = () => {
    const currentStep = state.wizardSteps[state.stepIndex];

    if (!currentStep) {
      return null;
    }

    const { displayElementFactory } = getQuestionaryDefinition(
      state.templateGroupId
    );

    return displayElementFactory.getDisplayElement(
      currentStep,
      isStepLocked(state.stepIndex) || previewMode
    );
  };

  if (isMobile) {
    const stepCount = stepsMetadata.length;
    const errorCount = header?.errorCount ?? 0;

    // A full-screen dialog's header sits outside the scrolling box, so these
    // offsets start at zero rather than below our own app bar.
    const toolbar = toolbarHeight(theme);
    const progressStickyTop = hasDialogAppBar ? 0 : toolbar;
    const stepBarStickyTop = hasDialogAppBar
      ? PROGRESS_HEIGHT
      : {
          xs: `calc(${toolbar.xs} + ${PROGRESS_HEIGHT}px)`,
          sm: `calc(${toolbar.sm} + ${PROGRESS_HEIGHT}px)`,
        };

    const navigatorSteps: WizardNavigatorStep[] = stepsMetadata.map(
      (metadata, index) => ({
        title: metadata.title,
        completed: metadata.isCompleted,
        secondary:
          index === state.stepIndex
            ? state.isDirty
              ? 'Current step · unsaved changes'
              : 'Current step'
            : undefined,
      })
    );

    const appBarSubtitle = state.isDirty ? 'unsaved changes' : undefined;

    return (
      <Box sx={{ width: '100%' }}>
        {!hasDialogAppBar && (
          <MobileAppBar
            title={title}
            subtitle={appBarSubtitle}
            onBack={() => navigate(-1)}
            sheetItems={header?.menuItems ?? []}
          />
        )}
        <LinearProgress
          variant="determinate"
          value={((state.stepIndex + 1) / stepCount) * 100}
          color={errorCount > 0 ? 'error' : 'primary'}
          sx={{
            height: PROGRESS_HEIGHT,
            position: 'sticky',
            top: progressStickyTop,
            zIndex: theme.zIndex.appBar - 1,
          }}
          data-cy="questionary-progress"
        />
        {stepCount > 1 && (
          <WizardStepBar
            stepIndex={state.stepIndex}
            stepCount={stepCount}
            title={stepsMetadata[state.stepIndex].title}
            navigatorOpen={navigatorOpen}
            onOpenNavigator={() => setNavigatorOpen((open) => !open)}
            stickyTop={stepBarStickyTop}
          />
        )}
        <Box sx={{ paddingX: 2, paddingY: 2.5 }}>{getStepContent()}</Box>
        <WizardStepNavigator
          open={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
          steps={navigatorSteps}
          activeStep={state.stepIndex}
          onSelect={(index) => {
            setNavigatorOpen(false);
            goToStep(index);
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: '500px',
      }}
    >
      <Typography
        variant="h6"
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

function QuestionaryWithHeader(props: QuestionaryProps) {
  return (
    <WizardHeaderProvider>
      <Questionary {...props} />
    </WizardHeaderProvider>
  );
}

export default withConfirm(QuestionaryWithHeader);
