import { StepButton } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import Stepper from "@material-ui/core/Stepper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useSnackbar } from "notistack";
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState
} from "react";
import { Prompt } from "react-router";
import { Proposal, Questionary } from "../generated/sdk";
import { useLoadProposal } from "../hooks/useLoadProposal";

import "../styles/ProposalComponentStyles.css";
import { clamp } from "../utils/Math";
import ProposalInformationView from "./ProposalInformationView";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import ProposalReview from "./ProposalReview";
import { ProposalStatus } from "../models/ProposalModel";

export interface INotification {
  variant: "error" | "success";
  message: string;
}

enum StepType {
  GENERAL,
  QUESTIONARY,
  REVIEW
}

export default function ProposalContainer(props: { data: Proposal }) {
  const { loadProposal } = useLoadProposal();
  const [proposalInfo, setProposalInfo] = useState(props.data);

  const [stepIndex, setStepIndex] = useState(0);
  const [proposalSteps, setProposalSteps] = useState<QuestionaryUIStep[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isSubmitted = proposalInfo.status === ProposalStatus.SUBMITTED;
  const classes = makeStyles(theme => ({
    paper: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3)
      }
    },
    stepper: {
      padding: theme.spacing(3, 0, 5)
    },
    heading: {
      textOverflow: "ellipsis",
      width: "80%",
      margin: "0 auto",
      textAlign: "center",
      minWidth: "450px",
      whiteSpace: "nowrap",
      overflow: "hidden"
    },
    infoline: {
      color: theme.palette.grey[600],
      textAlign: "right"
    }
  }))();

  const handleNext = (data: Partial<Proposal>) => {
    setProposalInfo({
      ...proposalInfo,
      ...data
    });
    setStepIndex(clampStep(stepIndex + 1));
    setIsDirty(false);
  };

  const handleBack = async () => {
    if (isDirty) {
      if (await handleReset()) {
        setStepIndex(clampStep(stepIndex - 1));
      }
    } else {
      setStepIndex(clampStep(stepIndex - 1));
    }
  };

  const clampStep = (step: number) => {
    return clamp(step, 0, proposalSteps.length - 1);
  };
  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (isDirty) {
      const confirmed = window.confirm(getConfirmNavigMsg());
      if (confirmed) {
        const proposalData = await loadProposal(proposalInfo.id);
        setProposalInfo(proposalData);
        setIsDirty(false);
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  const getConfirmNavigMsg = () => {
    return "Changes you recently made in this step will not be saved! Are you sure?";
  };

  useEffect(() => {
    const createProposalSteps = (
      questionary: Questionary
    ): QuestionaryUIStep[] => {
      var allProposalSteps = new Array<QuestionaryUIStep>();

      allProposalSteps.push(
        new QuestionaryUIStep(
          StepType.GENERAL,
          "New Proposal",
          proposalInfo.status !== ProposalStatus.BLANK,
          (
            <ProposalInformationView
              data={proposalInfo}
              setIsDirty={setIsDirty}
              readonly={isSubmitted}
            />
          )
        )
      );
      allProposalSteps = allProposalSteps.concat(
        questionary.steps.map((step, index, steps) => {
          let editable =
            (index === 0 && proposalInfo.status !== ProposalStatus.BLANK) ||
            step.isCompleted ||
            (steps[index - 1] && steps[index - 1].isCompleted === true);

          return new QuestionaryUIStep(
            StepType.QUESTIONARY,
            step.topic.topic_title,
            step.isCompleted,
            (
              <ProposalQuestionareStep
                topicId={step.topic.topic_id}
                data={proposalInfo}
                setIsDirty={setIsDirty}
                readonly={!editable || isSubmitted}
                key={step.topic.topic_id}
              />
            )
          );
        })
      );
      allProposalSteps.push(
        new QuestionaryUIStep(
          StepType.REVIEW,
          "Review",
          proposalInfo.status === ProposalStatus.SUBMITTED,
          (<ProposalReview data={proposalInfo} readonly={isSubmitted} />)
        )
      );
      return allProposalSteps;
    };

    const proposalSteps = createProposalSteps(proposalInfo.questionary!);
    setProposalSteps(proposalSteps);

    var lastFinishedStep = proposalSteps
      .slice()
      .reverse()
      .find(step => step.completed === true);

    setStepIndex(
      clamp(
        lastFinishedStep ? proposalSteps.indexOf(lastFinishedStep) + 1 : 0,
        0,
        proposalSteps.length - 1
      )
    );
  }, [proposalInfo, isSubmitted]);

  const getStepContent = (step: number) => {
    if (!proposalSteps || proposalSteps.length === 0) {
      return "Loading...";
    }

    if (!proposalSteps[step]) {
      console.error(`Invalid step ${step}`);
      return <span>Error</span>;
    }

    return proposalSteps[step].element;
  };

  const api = {
    next: handleNext,
    back: handleBack,
    reset: async () => {
      const stepBeforeReset = stepIndex;
      if (await handleReset()) {
        setStepIndex(stepBeforeReset);
      }
    },
    reportStatus: (notification: INotification) => {
      enqueueSnackbar(notification.message, { variant: notification.variant });
    }
  };

  return (
    <Container maxWidth="lg">
      <Prompt when={isDirty} message={location => getConfirmNavigMsg()} />
      <FormApi.Provider value={api}>
        <Paper className={classes.paper}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            className={classes.heading}
          >
            {proposalInfo.title || "New Proposal"}
          </Typography>
          <div className={classes.infoline}>
            {proposalInfo.shortCode
              ? `Proposal ID: ${proposalInfo.shortCode}`
              : null}
          </div>
          <div className={classes.infoline}>
            {ProposalStatus[proposalInfo.status]}
          </div>
          <Stepper nonLinear activeStep={stepIndex} className={classes.stepper}>
            {proposalSteps.map((step, index, steps) => (
              <Step key={step.title}>
                <QuestionaryStepButton
                  onClick={async () => {
                    if (!isDirty || (await handleReset())) {
                      setStepIndex(index);
                    }
                  }}
                  completed={step.completed}
                  editable={
                    index === 0 ||
                    step.completed ||
                    steps[index - 1].completed === true
                  }
                  clickable={true}
                >
                  <span>{step.title}</span>
                </QuestionaryStepButton>
              </Step>
            ))}
          </Stepper>

          {getStepContent(stepIndex)}
        </Paper>
      </FormApi.Provider>
    </Container>
  );
}

class QuestionaryUIStep {
  constructor(
    public stepType: StepType,
    public title: string,
    public completed: boolean,
    public element: JSX.Element
  ) {}
}

type CallbackSignature = (data: Partial<Proposal>) => void;
type VoidCallbackSignature = () => void;

export const FormApi = createContext<{
  next: CallbackSignature;
  back: VoidCallbackSignature;
  reset: VoidCallbackSignature;
  reportStatus: (notification: INotification) => void;
}>({
  next: () => {
    console.warn("Using default implementation for next");
  },
  back: () => {
    console.warn("Using default implementation for back");
  },
  reset: () => {
    console.warn("Using default implementation for reset");
  },
  reportStatus: () => {
    console.warn("Using default implementation for reportStatus");
  }
});

function QuestionaryStepButton(
  props: PropsWithChildren<any> & {
    active?: boolean;
    completed?: boolean;
    clickable: boolean;
    editable: boolean;
  }
) {
  const classes = makeStyles(theme => ({
    active: {
      "& SVG": {
        color: theme.palette.secondary.main + "!important"
      }
    },
    editable: {
      "& SVG": {
        color: theme.palette.primary.main + "!important"
      }
    }
  }))();

  const { active, clickable, editable } = props;

  var buttonClasses = [];

  if (active) {
    buttonClasses.push(classes.active);
  } else if (editable) {
    buttonClasses.push(classes.editable);
  }
  return (
    <StepButton
      {...props}
      disabled={!clickable}
      className={buttonClasses.join(" ")}
    >
      {props.children}
    </StepButton>
  );
}
