import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import ProposalInformation from './ProposalInformation';
import ProposalParticipants from './ProposalParticipants';
import ProposalReview from './ProposalReview';
import { request } from 'graphql-request'
import Container from '@material-ui/core/Container';


const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  }
}));



export default function ProposalSubmission({match}) {

  const steps = ['Information', 'Participants', 'Review'];
  const [proposalData, setProposalData] = useState({});
  const [proposalID, setProposalID] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const sendProposalRequest = () =>{  
    const query = `
    mutation($abstract: String!, $status: Int!, $users: [Int!]) {
      createProposal(abstract: $abstract, status: $status, users: $users){
       proposal{
        id
      }
        error
      }
    }
    `;

    const variables = {
      status: 1,
      abstract: proposalData.abstract,
      users: proposalData.users.map((user => user.username)),
    }
      request('/graphql', query, variables).then(data => setProposalID(data.createProposal.proposal.id));
  }

  const getProposalInformation = (id) => {
    
    const query = `
    query($id: ID!) {
      proposal(id: $id) {
        id
        abstract
        status
        users{
          firstname
          lastname
          id
          roles
        }
      }
    }
    `;

    const variables = {
      id
    }
      request('/graphql', query, variables).then(data => {
        setProposalData({
          title: "This is a dummy title as we do not save titles yet",
          abstract: data.proposal.abstract,
          id: data.proposal.id,
          users: data.proposal.users.map((user) => {return {name: user.firstname, surname: user.lastname, username: user.id}})
        })
        setLoading(false);
      });
  }


const handleNext = (data) => {
  setProposalData({
    ...proposalData,
    ...data
  });
  setStepIndex(stepIndex + 1)
};

const handleBack = () => {
  setStepIndex(stepIndex - 1)
};


const getStepContent = (step) => {
  switch (step) {
    case 0:
      return <ProposalInformation 
                data={proposalData} 
                next={handleNext}
                />;
    case 1:
      return <ProposalParticipants 
                data={proposalData} 
                next={handleNext}
                back={handleBack}
              />;
    case 2:
      return <ProposalReview
                data={proposalData}
                back={handleBack}
                submit={sendProposalRequest}
            />;
    default:
      throw new Error('Unknown step');
  }
}


  useEffect(() => {
    if(match.params.proposalID){
      getProposalInformation(match.params.proposalID);
    }else{
      setProposalData({});
    }
  }, [match.params.proposalID]);
  const classes = useStyles();


  return (match.params.proposalID && loading? (<p>Loading</p>) :(
      <Container maxWidth="lg" className={classes.container}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            {proposalData.id ? "Update Proposal" : "Proposal Submission" }
          </Typography>
          <Stepper activeStep={stepIndex} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {proposalID ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Your proposal has been submitted
                </Typography>
                <Typography variant="subtitle1">
                  Your proposal number is #{proposalID}. You will recieve an email regarding approval.
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {getStepContent(stepIndex)}
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </ Container>
  ));


}

