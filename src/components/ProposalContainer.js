import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import ProposalParticipants from "./ProposalParticipants";
import ProposalReview from "./ProposalReview";
import Container from "@material-ui/core/Container";
import { useDataAPI } from "../hooks/useDataAPI";
import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate";

const useStyles = makeStyles(theme => ({
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
}));

export default function ProposalContainer(props) {
  const steps = ["Information", "Crystallization", "Biological deuteration", "Chemical deuteration", "Participants", "Review"];
  const [proposalData, setProposalData] = useState(props.data);
  const [submitted, setSubmitted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const sendRequest = useDataAPI();
  const { loading, proposalQuestionModel } = useProposalQuestionTemplate();

  const submitProposal = () => {
    const query = `
    mutation($id: Int!){
      submitProposal(id: $id){
       proposal{
        id
      }
        error
      }
    }
    `;

    const variables = {
      id: props.data.id
    };

    return sendRequest(query, variables).then(data => setSubmitted(true));
  };

  const handleNext = data => {
    setProposalData({
      ...proposalData,
      ...data
    });
    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    setStepIndex(stepIndex - 1);
  };

  const getStepContent = step => {
    if(loading)
    {
      return "Loading...";
    }

    switch (step) {
      case 0:
        return (
          <ProposalQuestionareStep
            data={proposalData}
            next={handleNext}
            model={proposalQuestionModel}
            topic="general-information"
          />
        );
      case 1:
        return (
          <ProposalQuestionareStep
            data={proposalData}
            next={handleNext}
            back={handleBack}
            model={proposalQuestionModel}
            topic="crystallization"
          />
        );
      case 2:
        return (
          <ProposalQuestionareStep
            data={proposalData}
            next={handleNext}
            back={handleBack}
            model={proposalQuestionModel}
            topic="biological-deuteration"
          />
        );

      case 3:
        return (
          <ProposalQuestionareStep
            data={proposalData}
            next={handleNext}
            back={handleBack}
            model={proposalQuestionModel}
            topic="chemical-deuteration"
          />
        );
      case 4:
        return (
          <ProposalParticipants
            data={proposalData}
            next={handleNext}
            back={handleBack}
          />
        );
      case 5:
        return (
          <ProposalReview
            data={proposalData}
            back={handleBack}
            submit={submitProposal}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  };

  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
          {proposalData.status ? "Update Proposal" : "New Proposal"}
        </Typography>
        <Stepper activeStep={stepIndex} className={classes.stepper}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <React.Fragment>
          {submitted ? (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                {proposalData.status ? "Update Proposal" : "Sent Proposal"}
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>{getStepContent(stepIndex)}</React.Fragment>
          )}
        </React.Fragment>
      </Paper>
    </Container>
  );
}
