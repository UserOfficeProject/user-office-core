import React, { useState, useEffect, createContext } from "react";
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
import ErrorIcon from "@material-ui/icons/Error";
import { Zoom, StepButton } from "@material-ui/core";

export default function ProposalContainer(props: {
  data: ProposalInformation;
}) {
  const [proposalInfo, setProposalInfo] = useState(props.data);
  const [stepIndex, setStepIndex] = useState(0);
  const [proposalSteps, setProposalSteps] = useState<QuestionaryUIStep[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
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
  };

  const handleBack = (data: ProposalInformation) => {
    setProposalInfo({
      ...proposalInfo,
      ...data
    });
    setStepIndex(stepIndex - 1);
  };

  const handleError = (msg: string) => {
    setErrorMessage(msg);
  };

  useEffect(() => {
    const createProposalSteps = (
      questionary: Questionary
    ): QuestionaryUIStep[] => {
      var allProposalSteps = new Array<QuestionaryUIStep>();

      allProposalSteps.push(
        new QuestionaryUIStep(
          "New Proposal",
          true,
          <ProposalInformationView data={proposalInfo} />
        )
      );
      allProposalSteps = allProposalSteps.concat(
        questionary.steps.map(
          step =>
            new QuestionaryUIStep(
              step.topic.topic_title,
              step.isCompleted,
              (
                <ProposalQuestionareStep
                  topicId={step.topic.topic_id}
                  data={proposalInfo}
                />
              )
            )
        )
      );
      allProposalSteps.push(
        new QuestionaryUIStep(
          "Review",
          proposalInfo.status === ProposalStatus.SUBMITTED,
          <ProposalReview data={proposalInfo} />
        )
      );
      return allProposalSteps;
    };

    const proposalSteps = createProposalSteps(proposalInfo.questionary!);
    setProposalSteps(proposalSteps);
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

  const api = { next: handleNext, back: handleBack, error: handleError };

  return (
    <Container maxWidth="lg">
      <FormApi.Provider value={api}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            {false ? "Update Proposal" : "New Proposal"}
          </Typography>
          <Stepper nonLinear activeStep={stepIndex} className={classes.stepper}>
            {proposalSteps.map((proposalStep, index) => (
              <Step key={proposalStep.title}>
                <QuestionaryStepButton
                  completed={proposalStep.completed}
                  disabled={!proposalStep.completed}
                  onClick={() => {
                    setStepIndex(index);
                  }}
                >
                  {proposalStep.title}
                </QuestionaryStepButton>
              </Step>
            ))}
          </Stepper>
          {proposalInfo.status === ProposalStatus.DRAFT ? (
            <React.Fragment>
              {getStepContent(stepIndex)}
              <ErrorMessageBox message={errorMessage} />
            </React.Fragment>
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
    public title: string,
    public completed: boolean,
    public element: JSX.Element
  ) {}
}

const ErrorMessageBox = (props: { message?: string | undefined }) => {
  const classes = makeStyles(() => ({
    error: {
      color: "#ff0000",
      padding: "10px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end"
    },
    icon: {
      margin: "5px"
    }
  }))();
  return (
    <Zoom in={props.message !== undefined} mountOnEnter unmountOnExit>
      <div className={classes.error}>
        <ErrorIcon className={classes.icon} /> {props.message}
      </div>
    </Zoom>
  );
};

type CallbackSignature = (data: ProposalInformation) => void;

export const FormApi = createContext<{
  next: CallbackSignature;
  back: CallbackSignature;
  error: (msg: string) => void;
}>({
  next: () => {
    console.warn("Using default implementation for next");
  },
  back: () => {
    console.warn("Using default implementation for back");
  },
  error: () => {
    console.warn("Using default implementation for error");
  }
});

function QuestionaryStepButton(props: any) {
  const classes = makeStyles(theme => ({
    active: {
      "& SVG": {
        color: theme.palette.secondary.main + "!important"
      }
    }
  }))();

  const { active } = props;

  return (
    <StepButton {...props} className={active ? classes.active : null}>
      {props.children}
    </StepButton>
  );
}
