import React, { useState, useEffect, useContext, createContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import ProposalParticipants from "./ProposalParticipants";
import ProposalReview from "./ProposalReview";
import Container from "@material-ui/core/Container";
import { useDataAPI } from "../hooks/useDataAPI";
import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import { ProposalTemplate } from "../model/ProposalModel";
import ProposalInformation from "./ProposalInformation";

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


export default function ProposalContainer(props:any) {
  const [proposalData, setProposalData] = useState(props.data);
  const [submitted, setSubmitted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const sendRequest = useDataAPI();
  const { proposalTemplate } = useProposalQuestionTemplate();
  const [ proposalSteps, setProposalSteps ] = useState<ProposalStep[]>([]);
  const classes = useStyles();
  
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

    return sendRequest(query, variables).then(() => setSubmitted(true));
  };

  const handleNext = (data:any) => {
    setProposalData({
      ...proposalData,
      ...data
    });
    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    setStepIndex(stepIndex - 1);
  };

  const createProposalSteps = (proposalTemplate:ProposalTemplate):ProposalStep[] => {
    var allProposalSteps = [];

    allProposalSteps.push(
    new ProposalStep(
      "New Proposal (tmp)", 
      <ProposalInformation data={proposalData}/>
      )
    );
    allProposalSteps = allProposalSteps.concat(proposalTemplate.topics.map(topic => 
      new ProposalStep(
        topic.topic_title, 
        <ProposalQuestionareStep
          model={proposalTemplate}
          topicId={topic.topic_id}
        />
    )));
    allProposalSteps.push(
      new ProposalStep(
        'Participants' , 
        <ProposalParticipants data={proposalData}/>
      )
    );
    allProposalSteps.push(
      new ProposalStep(
        'Review',
        <ProposalReview data={proposalData}/>
      )
    );
    return allProposalSteps;
  }

  useEffect(() => {
    if (proposalTemplate) {
      const proposalSteps = createProposalSteps(proposalTemplate);
      setProposalSteps(proposalSteps)
    }
  }, [proposalTemplate]);

  
  const getStepContent = (step:number) => {
    if(!proposalSteps || proposalSteps.length === 0) {
      return "Loading...";
    }

    if(!proposalSteps[step]) {
      console.error(`Invalid step ${step}`);
      return <span>Error</span>
    }

    return proposalSteps[step].element;
  };

  const api = {next:handleNext, back:handleBack, submit:submitProposal};


  return (
    <Container maxWidth="lg">
      <FormApi.Provider value={api}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            {false ? "Update Proposal" : "New Proposal"}
          </Typography>
          <Stepper activeStep={stepIndex} className={classes.stepper}>
            {proposalSteps.map(proposalStep => (
              <Step key={proposalStep.title}>
                <StepLabel>{proposalStep.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {submitted ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  {false ? "Update Proposal" : "Sent Proposal"}
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>{getStepContent(stepIndex)}</React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </FormApi.Provider>
    </Container>
  );
}


class ProposalStep {
  constructor(public title: string, public element: JSX.Element) {}
}

export const FormApi = createContext<{next:Function | null, back:Function | null, submit:Function | null}>({next:null, back: null, submit:null});

