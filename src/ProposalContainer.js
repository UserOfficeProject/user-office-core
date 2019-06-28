import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import ProposalInformation from "./ProposalInformation";
import ProposalParticipants from "./ProposalParticipants";
import ProposalReview from "./ProposalReview";
import { request } from "graphql-request";
import Container from "@material-ui/core/Container";

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
  const steps = ["Information", "Participants", "Review"];
  const [proposalData, setProposalData] = useState(props.data);
  const [submitted, setSubmitted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

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

    request("/graphql", query, variables).then(data => setSubmitted(true));
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
    switch (step) {
      case 0:
        return <ProposalInformation data={proposalData} next={handleNext} />;
      case 1:
        return (
          <ProposalParticipants
            data={proposalData}
            next={handleNext}
            back={handleBack}
          />
        );
      case 2:
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
