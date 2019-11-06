import React, {
  useState,
  useEffect,
  createContext,
  PropsWithChildren
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import ProposalReview from "./ProposalReview";
import Container from "@material-ui/core/Container";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import { ProposalStatus, Questionary } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";
import ProposalInformationView from "./ProposalInformationView";
import { useLoadProposal } from "../hooks/useLoadProposal";
import Notification from "./Notification";
import { StepButton } from "@material-ui/core";

export interface INotification {
  variant: "error" | "success";
  message: string;
}

enum StepType {
  GENERAL,
  QUESTIONARY,
  REVIEW
}

export default function ProposalContainer(props: {
  data: ProposalInformation;
}) {
  const { loadProposal } = useLoadProposal();
  const [proposalInfo, setProposalInfo] = useState(props.data);

  const [stepIndex, setStepIndex] = useState(0);
  const [proposalSteps, setProposalSteps] = useState<QuestionaryUIStep[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [notification, setNotification] = useState<
    INotification & { isOpen: boolean }
  >({
    isOpen: false,
    variant: "success",
    message: ""
  });
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
    }
  }))();

  const handleNext = (data: ProposalInformation) => {
    setProposalInfo({
      ...proposalInfo,
      ...data
    });
    setStepIndex(stepIndex + 1);
    setIsDirty(false);
  };

  const handleBack = async (data: ProposalInformation) => {
    setProposalInfo({
      ...proposalInfo,
      ...data
    });
    setStepIndex(stepIndex - 1);
    setIsDirty(false);
  };

  /**
   * Returns true if reset was peformed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Changes you recently made in this step will not be saved! Are you sure?"
      );
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
            />
          )
        )
      );
      allProposalSteps = allProposalSteps.concat(
        questionary.steps.map(
          (step, index, steps) =>
            new QuestionaryUIStep(
              StepType.QUESTIONARY,
              step.topic.topic_title,
              step.isCompleted,
              (
                <ProposalQuestionareStep
                  topicId={step.topic.topic_id}
                  data={proposalInfo}
                  setIsDirty={setIsDirty}
                  editable={
                    (index === 0 &&
                      proposalInfo.status !== ProposalStatus.BLANK) ||
                    step.isCompleted ||
                    (index > 0 && steps[index - 1].isCompleted === true)
                  }
                  key={step.topic.topic_id}
                />
              )
            )
        )
      );
      allProposalSteps.push(
        new QuestionaryUIStep(
          StepType.REVIEW,
          "Review",
          proposalInfo.status === ProposalStatus.SUBMITTED,
          <ProposalReview data={proposalInfo} />
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
      Math.max(
        0,
        lastFinishedStep ? proposalSteps.indexOf(lastFinishedStep) + 1 : 0
      )
    );
  }, [proposalInfo]);

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
      setNotification({ ...notification, isOpen: true });
    }
  };

  return (
    <Container maxWidth="lg">
      <Notification
        open={notification.isOpen}
        onClose={() => {
          setNotification({ ...notification, isOpen: false });
        }}
        variant={notification.variant}
        message={notification.message}
      />
      <FormApi.Provider value={api}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            {false ? "Update Proposal" : "New Proposal"}
          </Typography>
          <Stepper nonLinear activeStep={stepIndex} className={classes.stepper}>
            {proposalSteps.map((step, index, steps) => (
              <Step key={step.title}>
                <QuestionaryStepButton
                  onClick={async () => {
                    if (
                      !isDirty ||
                      proposalInfo.status === ProposalStatus.BLANK ||
                      (await handleReset())
                    ) {
                      setStepIndex(index);
                    }
                  }}
                  completed={step.completed}
                  editable={
                    index === 0 ||
                    step.completed ||
                    steps[index - 1].completed === true
                  }
                  clickable={
                    step.stepType !== StepType.REVIEW ||
                    steps.every(step => {
                      return (
                        step.stepType === StepType.REVIEW || step.completed
                      );
                    })
                  }
                >
                  <span>{step.title}</span>
                </QuestionaryStepButton>
              </Step>
            ))}
          </Stepper>
          {proposalInfo.status !== ProposalStatus.SUBMITTED ? (
            <React.Fragment>{getStepContent(stepIndex)}</React.Fragment>
          ) : (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                {false ? "Update Proposal" : "Sent Proposal"}
              </Typography>
            </React.Fragment>
          )}
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

type CallbackSignature = (data: ProposalInformation) => void;
type VoidCallbackSignature = () => void;

export const FormApi = createContext<{
  next: CallbackSignature;
  back: CallbackSignature;
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
