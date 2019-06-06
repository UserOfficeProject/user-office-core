import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ProposalInformation from './ProposalInformation';
import ProposalParticipants from './ProposalParticipants';
import { request } from 'graphql-request'
import { Link } from "react-router-dom";

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
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
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
});

const steps = ['Information', 'Participants', 'Review'];

class ProposalSubmission extends React.Component {


  constructor(props) {
    super(props);

    this.state = { proposalData: {

    },
    stepIndex: 0,
    };
  }

onChange(name, value){
  this.setState({...this.state, proposalData: {
    ...this.state.proposalData,
    [name]: value
  }})
  console.log(this.state)
}


getStepContent(step) {
  switch (step) {
    case 0:
      return <ProposalInformation onChange={this.onChange.bind(this)}/>;
    case 1:
      return <ProposalParticipants onChange={this.onChange.bind(this)}/>;
    case 2:
      return <p> Review and Submit </p>;
    default:
      throw new Error('Unknown step');
  }
}


sendProposalRequest(){
  const query = `mutation {
    createProposal(abstract: "${this.state.proposalData.abstract}", status: 1, users: ${this.state.proposalData.user.map((user => user.username))}){
     proposal{
      abstract
    }
      error
    }
  }`
     
    request('/graphql', query).then(data => console.log(data))
}


render() {
  const {classes} = this.props;
  const activeStep = this.state.stepIndex;
  const handleNext = () => {
    this.setState({stepIndex: this.state.stepIndex + 1})
    if(this.state.stepIndex === steps.length - 1){
      this.sendProposalRequest();
    }
  };

  const handleBack = () => {
    this.setState({stepIndex: this.state.stepIndex - 1})
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="absolute" color="default" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            <Link to="/">DUO2</Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            Proposal Submission
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Your proposal has been submitted
                </Typography>
                <Typography variant="subtitle1">
                  Your proposal number is #2001539. You will recieve an email regarding approval
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.getStepContent(activeStep)}
                <div className={classes.buttons}>
                  {activeStep !== 0 && (
                    <Button onClick={handleBack} className={classes.button}>
                      Back
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </main>
    </React.Fragment>
  );
}

}

export default withStyles(styles)(ProposalSubmission);