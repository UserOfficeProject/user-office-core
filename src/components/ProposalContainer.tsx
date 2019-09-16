import React, { useState, useEffect, createContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import ProposalParticipants from "./ProposalParticipants";
import ProposalReview from "./ProposalReview";
import Container from "@material-ui/core/Container";
import ProposalQuestionareStep from "./ProposalQuestionareStep";
import { ProposalTemplate, ProposalData } from "../model/ProposalModel";
import ProposalInformation from "./ProposalInformation";
import ErrorIcon from '@material-ui/icons/Error';
import {useSubmitProposal} from '../hooks/useSubmitProposal';
import { Zoom } from "@material-ui/core";




export default function ProposalContainer(props:{data:ProposalData, template:ProposalTemplate}) {
  const [proposalData, setProposalData] = useState(props.data);
  const [stepIndex, setStepIndex] = useState(0);
  const [ proposalSteps, setProposalSteps ] = useState<ProposalStep[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const {submitted, submitProposal} = useSubmitProposal()
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
  
  
  const handleNext = (data:ProposalData) => {
    setProposalData({
      ...proposalData,
      ...data
    });
    
    setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    setStepIndex(stepIndex - 1);
  };

  const handleError = (msg:string) => {
    setErrorMessage(msg);
  }


  useEffect(() => {
    const createProposalSteps = (proposalTemplate:ProposalTemplate):ProposalStep[] => {
      var allProposalSteps = new Array<ProposalStep>();
  
      allProposalSteps.push(
      new ProposalStep(
        "New Proposal", 
        <ProposalInformation data={proposalData}/>
        )
      );    
      allProposalSteps = allProposalSteps.concat(proposalTemplate.topics.map(topic => 
        new ProposalStep(
          topic.topic_title, 
          <ProposalQuestionareStep
            model={proposalTemplate}
            topicId={topic.topic_id}
            data={proposalData}
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

    const proposalSteps = createProposalSteps(props.template);
    setProposalSteps(proposalSteps);

  }, [props.template, proposalData]);

  
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

  const api = {next:handleNext, back:handleBack, submit:submitProposal, error:handleError};


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
              <React.Fragment>
              {getStepContent(stepIndex)}
              <ErrorMessageBox message={errorMessage} />
              </React.Fragment>
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

const ErrorMessageBox = (props:{message?:string | undefined}) => {
  const classes = makeStyles(() => ({
    error: {
      color:"#ff0000",
      padding:"10px 0",
      display:"flex",
      alignItems:"center",
      justifyContent:"flex-end",
    },
    icon: {
      margin:"5px"
    }
  }))();
    return <Zoom in={props.message !== undefined} mountOnEnter unmountOnExit>
      <div className={classes.error}><ErrorIcon className={classes.icon}/> {props.message}</div>
      </Zoom>
  
}

export const FormApi = createContext<{next:Function | null, back:Function | null, submit:Function | null, error:Function | null}>({next:null, back: null, submit:null, error:null});

