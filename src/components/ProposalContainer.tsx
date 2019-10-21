import React, { useState, useEffect, createContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import ProposalReview from "./ProposalReview";
import Container from "@material-ui/core/Container";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import {
  ProposalStatus,
  Questionary
} from "../model/ProposalModel";
import { ProposalInformation } from "../model/ProposalModel";
import ProposalInformationView from "./ProposalInformationView";
import ErrorIcon from "@material-ui/icons/Error";
import { Zoom, StepButton } from "@material-ui/core";

export default function ProposalContainer(props: { data: ProposalInformation }) {
  const [proposalData, setProposalData] = useState(props.data);
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
    setProposalData({
      ...proposalData,
      ...data
    });

    setStepIndex(stepIndex + 1);
  };

  const handleBack = (data: ProposalInformation) => {
    setProposalData({
      ...proposalData,
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
          <ProposalInformationView data={proposalData} />
        )
      );
      allProposalSteps = allProposalSteps.concat(
        questionary.steps.map(
          step =>
            new QuestionaryUIStep(
              step.topic.topic_title,
              (
                <ProposalQuestionareStep
                  topicId={step.topic.topic_id}
                  data={proposalData}
                />
              )
            )
        )
      );
      allProposalSteps.push(
        new QuestionaryUIStep("Review", <ProposalReview data={proposalData} />)
      );
      return allProposalSteps;
    };

    const proposalSteps = createProposalSteps(proposalData.questionary!);
    setProposalSteps(proposalSteps);
  }, [proposalData]);

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
                <StepButton
                  onClick={() => {
                    setStepIndex(index);
                  }}
                >
                  {proposalStep.title}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          {proposalData.status === ProposalStatus.DRAFT ? (
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
  constructor(public title: string, public element: JSX.Element) {}
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
